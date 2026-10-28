import { LanguageModel, GenerateResponseParams } from '../../app/ports/LanguageModel';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class LocalLanguageModel implements LanguageModel {
  async generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>> {
    return Result.ok(this.compose(params));
  }

  async *streamResponse(params: GenerateResponseParams): AsyncIterable<string> {
    const text = this.compose(params);

    // Se emite en trozos para que el fallback se vea igual que una respuesta real.
    for (const chunk of text.match(/.{1,24}(\s|$)/g) ?? [text]) {
      yield chunk;
    }
  }

  private compose(params: GenerateResponseParams): string {
    const hasGlucoseContext = Boolean(params.context) && !params.context!.includes('Aún no tienes');

    if (!hasGlucoseContext) {
      return (
        '¡Hola! Soy Gluco, tu acompañante en este camino. Todavía no veo registros recientes de glucosa. ' +
        '¿Quieres que te ayude a interpretar tus niveles, a planear una comida o a mantener hábitos saludables? ' +
        'Recuerda que no reemplazo la opinión de tu médico.'
      );
    }

    return (
      `¡Gracias por compartirlo! Esto es lo que observo en tus datos recientes:\n\n${params.context}\n\n` +
      'Soy un apoyo para interpretar tendencias generales, no sustituyo a tu profesional de salud. ' +
      'Si tienes dudas sobre tratamiento, consulta con tu médico.'
    );
  }
}