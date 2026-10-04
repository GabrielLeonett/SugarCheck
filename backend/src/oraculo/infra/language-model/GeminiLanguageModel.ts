import { LanguageModel, GenerateResponseParams, LanguageModelMessage } from '../../app/ports/LanguageModel';
import { LanguageModelError } from '../../core/conversation/errors/LanguageModelError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** La API de Gemini devuelve 503 con mucha frecuencia por demanda alta. */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 400;
const REQUEST_TIMEOUT_MS = 30_000;

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[]; role?: string };
  finishReason?: string;
}

interface GeminiPayload {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string; blockReasonMessage?: string };
  error?: { message?: string };
}

export class GeminiLanguageModel implements LanguageModel {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>> {
    const response = await this.request(`${this.model}:generateContent`, params, false);

    if (!response.ok) {
      return Result.fail(await this.toError(response));
    }

    const payload = (await response.json()) as GeminiPayload;
    const blocked = this.blockReasonOf(payload);
    if (blocked) {
      return Result.fail(new LanguageModelError(blocked));
    }

    const text = this.extractText(payload);
    if (!text) {
      return Result.fail(new LanguageModelError('El proveedor de IA no devolvió una respuesta'));
    }

    return Result.ok(text);
  }

  async *streamResponse(
    params: GenerateResponseParams,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    const response = await this.request(`${this.model}:streamGenerateContent?alt=sse`, params, true, signal);

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
          // El último evento puede llegar sin su separador de cierre.
          const tail = this.readEvent(buffer);
          if (tail) yield tail;
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Gemini separa los eventos con CRLF CRLF, no con LF LF. Buscar solo
        // "\n\n" dejaba el stream entero sin partir y devolvía un solo trozo.
        for (let boundary = this.findBoundary(buffer); boundary; boundary = this.findBoundary(buffer)) {
          const text = this.readEvent(buffer.slice(0, boundary.index));
          buffer = buffer.slice(boundary.index + boundary.length);
          if (text) yield text;
        }
      }
    } catch (error) {
      // Un corte de conexión llega como AbortError en crudo ("This operation
      // was aborted"), que no le dice nada a quien lo lee.
      if (signal?.aborted) {
        throw new LanguageModelError('La consulta fue cancelada');
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  private findBoundary(buffer: string): { index: number; length: number } | null {
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
    action: string,
    params: GenerateResponseParams,
    streaming: boolean,
    callerSignal?: AbortSignal,
  ): Promise<Response> {
    const url = `${API_BASE}/${action}`;
    const body = JSON.stringify(this.buildBody(params));

    let lastError = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
      const signal = callerSignal
        ? AbortSignal.any([callerSignal, timeout])
        : timeout;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body,
          signal,
        });

        if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
          return response;
        }

        lastError = await this.errorMessage(response);

        // Si el cliente se fue, no tiene sentido reintentar.
        if (callerSignal?.aborted) {
          throw new LanguageModelError('La consulta fue cancelada');
        }
      } catch (error) {
        if (error instanceof LanguageModelError) throw error;
        if (callerSignal?.aborted) {
          throw new LanguageModelError('La consulta fue cancelada');
        }
        lastError = error instanceof Error ? error.message : 'No se pudo conectar con el proveedor de IA';
      }

      if (attempt < MAX_ATTEMPTS) {
        await this.delay(BASE_BACKOFF_MS * 2 ** (attempt - 1), callerSignal);
      }
    }

    throw new LanguageModelError(lastError || 'El proveedor de IA no está disponible en este momento');
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

  private buildBody(params: GenerateResponseParams): Record<string, unknown> {
    const systemParts = [
      params.systemPrompt,
      params.context ? `Contexto de glucosa del usuario:\n${params.context}` : null,
    ].filter((text): text is string => Boolean(text));

    return {
      contents: this.toContents(params.messages),
      systemInstruction: { parts: systemParts.map((text) => ({ text })) },
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
        // Sin razonamiento interno: baja latencia y costo, que es lo que
        // necesita un chat breve para niños.
        thinkingConfig: { thinkingBudget: 0 },
      },
    };
  }

  private toContents(messages: LanguageModelMessage[]): unknown[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }

  // --- Parseo ---------------------------------------------------------------

  /** Extrae el texto de un evento SSE. Lanza si el proveedor bloqueó la consulta. */
  private readEvent(event: string): string {
    if (!event.trim()) return '';

    const line = event.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return '';

    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return '';

    let payload: GeminiPayload;
    try {
      payload = JSON.parse(data) as GeminiPayload;
    } catch {
      return ''; // Evento corrupto: mejor ignorarlo que cortar el stream.
    }

    const blocked = this.blockReasonOf(payload);
    if (blocked) {
      throw new LanguageModelError(blocked);
    }

    return payload.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('') ?? '';
  }

  private extractText(payload: GeminiPayload): string {
    return (
      payload.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? '')
        .join('')
        .trim() ?? ''
    );
  }

  private blockReasonOf(payload: GeminiPayload): string | null {
    const reason = payload.promptFeedback?.blockReason;
    return reason ? `La consulta fue bloqueada por el proveedor de IA (${reason})` : null;
  }

  // --- Errores --------------------------------------------------------------

  private async toError(response: Response): Promise<LanguageModelError> {
    return new LanguageModelError(await this.errorMessage(response));
  }

  private async errorMessage(response: Response): Promise<string> {
    try {
      const payload = (await response.json()) as GeminiPayload;
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