import { LanguageModel, GenerateResponseParams } from '../../app/ports/LanguageModel';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

/**
 * Envuelve al proveedor de IA real y cae al modelo local si este no puede
 * responder. Así el chat sigue funcionando cuando la API key está vencida,
 * revocada o el proveedor está caído, en vez de dejar la conversación vacía.
 */
export class FallbackLanguageModel implements LanguageModel {
  constructor(
    private readonly primary: LanguageModel,
    private readonly fallback: LanguageModel,
  ) {}

  async generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>> {
    const result = await this.primary.generateResponse(params);
    if (result.isValid) return result;

    this.warn(result.getError().message);
    return this.fallback.generateResponse(params);
  }

  async *streamResponse(
    params: GenerateResponseParams,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    let started = false;

    try {
      for await (const chunk of this.primary.streamResponse(params, signal)) {
        started = true;
        yield chunk;
      }
    } catch (error) {
      // Si ya se envió texto no se puede reiniciar la respuesta sin duplicarlo.
      // El controlador se encarga de mostrar el error en ese caso.
      if (started || signal?.aborted) throw error;

      this.warn(error instanceof Error ? error.message : String(error));
      yield* this.fallback.streamResponse(params, signal);
    }
  }

  private warn(reason: string): void {
    console.warn(`[Oráculo] El proveedor de IA falló (${reason}). Usando respuesta local.`);
  }
}
