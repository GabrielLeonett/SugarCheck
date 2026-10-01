import { LanguageModel, GenerateResponseParams } from '../../app/ports/LanguageModel';
import { LanguageModelError } from '../../core/conversation/errors/LanguageModelError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class GeminiLanguageModel implements LanguageModel {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>> {
    try {
      const contents = params.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemParts = [
        params.systemPrompt,
        params.context ? `Contexto de glucosa del usuario:\n${params.context}` : null,
      ].filter((text): text is string => Boolean(text));

      const body: Record<string, unknown> = {
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      };

      if (systemParts.length > 0) {
        body.systemInstruction = { parts: systemParts.map((text) => ({ text })) };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return Result.fail(new LanguageModelError('El proveedor de IA devolvió un error'));
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const text = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? '')
        .join('')
        .trim();

      if (!text) {
        return Result.fail(new LanguageModelError('El proveedor de IA no devolvió una respuesta'));
      }

      return Result.ok(text);
    } catch {
      return Result.fail(new LanguageModelError('No se pudo conectar con el proveedor de IA'));
    }
  }
}
