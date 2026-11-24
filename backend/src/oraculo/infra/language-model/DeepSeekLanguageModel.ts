import {
  LanguageModel,
  GenerateResponseParams,
  LanguageModelMessage,
} from '../../app/ports/LanguageModel';
import { LanguageModelError } from '../../core/conversation/errors/LanguageModelError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

const API_URL = 'https://api.deepseek.com/chat/completions';
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 400;
const REQUEST_TIMEOUT_MS = 60_000;

interface DeepSeekError {
  message?: string;
  type?: string;
  code?: string;
}

interface DeepSeekChoice {
  finish_reason?: string | null;
  message?: {
    content?: string | null;
    refusal?: string | null;
  };
  delta?: {
    // El contenido de razonamiento se ignora: el Oráculo solo muestra la respuesta final.
    content?: string | null;
  };
}

interface DeepSeekPayload {
  choices?: DeepSeekChoice[];
  error?: DeepSeekError;
}

/**
 * Implementación del puerto LanguageModel contra la API compatible con OpenAI
 * de DeepSeek. Usa `deepseek-flash` (DeepSeek-V4.1-Flash) sin modo de
 * razonamiento para mantener baja la latencia y el costo del chat.
 */
export class DeepSeekLanguageModel implements LanguageModel {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateResponse(
    params: GenerateResponseParams,
  ): Promise<Result<string, ErrorAbstract>> {
    let response: Response;

    try {
      response = await this.request(params, false);
    } catch (error) {
      return Result.fail(this.asLanguageModelError(error));
    }

    if (!response.ok) {
      return Result.fail(await this.toError(response));
    }

    const payload = (await response.json()) as DeepSeekPayload;
    const failure = this.failureReason(payload);
    if (failure) {
      return Result.fail(new LanguageModelError(failure));
    }

    const text = payload.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      return Result.fail(
        new LanguageModelError('El proveedor de IA no devolvió una respuesta'),
      );
    }

    return Result.ok(text);
  }

  async *streamResponse(
    params: GenerateResponseParams,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    const response = await this.request(params, true, signal);

    if (!response.ok) {
      throw new LanguageModelError(await this.errorMessage(response));
    }

    if (!response.body) {
      throw new LanguageModelError('El proveedor de IA no devolvió un stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const tail = this.readEvent(buffer);
          if (tail) yield tail;
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        for (
          let boundary = this.findBoundary(buffer);
          boundary;
          boundary = this.findBoundary(buffer)
        ) {
          const text = this.readEvent(buffer.slice(0, boundary.index));
          buffer = buffer.slice(boundary.index + boundary.length);
          if (text) yield text;
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new LanguageModelError('La consulta fue cancelada');
      }
      if (error instanceof LanguageModelError) throw error;
      throw new LanguageModelError(
        'Se perdió la conexión con el proveedor de IA',
      );
    } finally {
      reader.releaseLock();
    }
  }

  private findBoundary(
    buffer: string,
  ): { index: number; length: number } | null {
    const crlf = buffer.indexOf('\r\n\r\n');
    const lf = buffer.indexOf('\n\n');

    if (crlf !== -1 && (lf === -1 || crlf <= lf + 1)) {
      return { index: crlf, length: 4 };
    }
    if (lf !== -1) {
      return { index: lf, length: 2 };
    }
    return null;
  }

  // --- Transporte -----------------------------------------------------------

  private async request(
    params: GenerateResponseParams,
    streaming: boolean,
    callerSignal?: AbortSignal,
  ): Promise<Response> {
    const body = JSON.stringify(this.buildBody(params, streaming));

    let lastError = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
      const signal = callerSignal
        ? AbortSignal.any([callerSignal, timeout])
        : timeout;

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: streaming ? 'text/event-stream' : 'application/json',
          },
          body,
          signal,
        });

        if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
          return response;
        }

        lastError = await this.errorMessage(response);

        if (callerSignal?.aborted) {
          throw new LanguageModelError('La consulta fue cancelada');
        }
      } catch (error) {
        if (error instanceof LanguageModelError) throw error;
        if (callerSignal?.aborted) {
          throw new LanguageModelError('La consulta fue cancelada');
        }
        lastError =
          error instanceof Error
            ? error.message
            : 'No se pudo conectar con el proveedor de IA';
      }

      if (attempt < MAX_ATTEMPTS) {
        await this.delay(BASE_BACKOFF_MS * 2 ** (attempt - 1), callerSignal);
      }
    }

    throw new LanguageModelError(
      lastError || 'El proveedor de IA no está disponible en este momento',
    );
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new LanguageModelError('La consulta fue cancelada'));
        return;
      }
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      const onAbort = () => {
        clearTimeout(timer);
        reject(new LanguageModelError('La consulta fue cancelada'));
      };
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  // --- Construcción del cuerpo ---------------------------------------------

  private buildBody(
    params: GenerateResponseParams,
    streaming: boolean,
  ): Record<string, unknown> {
    const systemParts = [
      params.systemPrompt,
      params.context
        ? `Contexto de glucosa del usuario:\n${params.context}`
        : null,
    ].filter((text): text is string => Boolean(text));

    return {
      model: this.model,
      messages: [
        { role: 'system', content: systemParts.join('\n\n') },
        ...this.toMessages(params.messages),
      ],
      temperature: 0.4,
      max_tokens: 600,
      // Chat breve para niños: sin cadena de razonamiento interna.
      thinking: { type: 'disabled' },
      stream: streaming,
    };
  }

  private toMessages(messages: LanguageModelMessage[]): LanguageModelMessage[] {
    return messages.filter((message) => message.role !== 'system');
  }

  // --- Parseo ---------------------------------------------------------------

  /** Extrae el texto de un evento SSE. Lanza si el proveedor bloqueó la consulta. */
  private readEvent(event: string): string {
    if (!event.trim()) return '';

    const line = event.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return '';

    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return '';

    let payload: DeepSeekPayload;
    try {
      payload = JSON.parse(data) as DeepSeekPayload;
    } catch {
      return ''; // Evento corrupto: mejor ignorarlo que cortar el stream.
    }

    if (payload.error?.message) {
      throw new LanguageModelError(payload.error.message);
    }

    const failure = this.failureReason(payload);
    if (failure) {
      throw new LanguageModelError(failure);
    }

    return payload.choices?.[0]?.delta?.content ?? '';
  }

  private failureReason(payload: DeepSeekPayload): string | null {
    const choice = payload.choices?.[0];
    if (choice?.message?.refusal) {
      return `La consulta fue bloqueada por el proveedor de IA (${choice.message.refusal})`;
    }

    const reason = choice?.finish_reason;
    if (reason === 'content_filter') {
      return 'La consulta fue bloqueada por el proveedor de IA';
    }
    if (reason === 'insufficient_system_resource' || reason === 'aborted') {
      return 'El proveedor de IA no pudo completar la respuesta. Inténtalo de nuevo.';
    }

    return null;
  }

  // --- Errores --------------------------------------------------------------

  private asLanguageModelError(error: unknown): LanguageModelError {
    if (error instanceof LanguageModelError) return error;
    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con el proveedor de IA';
    return new LanguageModelError(message);
  }

  private async toError(response: Response): Promise<LanguageModelError> {
    return new LanguageModelError(await this.errorMessage(response));
  }

  private async errorMessage(response: Response): Promise<string> {
    if (response.status === 401) {
      return 'La API key del proveedor de IA no es válida.';
    }
    if (response.status === 402) {
      return 'El proveedor de IA no tiene saldo disponible en este momento.';
    }
    if (response.status === 429) {
      return 'El asistente está recibiendo muchas consultas. Inténtalo de nuevo en un momento.';
    }

    try {
      const payload = (await response.json()) as DeepSeekPayload;
      const detail = payload.error?.message;
      if (detail) {
        return response.status === 503
          ? 'El asistente está temporalmente saturado. Inténtalo de nuevo en un momento.'
          : detail;
      }
    } catch {
      // Cuerpo no JSON: usamos un mensaje genérico según el status.
    }

    return response.status === 503
      ? 'El asistente está temporalmente saturado. Inténtalo de nuevo en un momento.'
      : `El proveedor de IA devolvió un error (${response.status})`;
  }
}
