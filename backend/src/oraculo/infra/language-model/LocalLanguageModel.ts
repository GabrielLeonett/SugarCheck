import { LanguageModel, GenerateResponseParams } from '../../app/ports/LanguageModel';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class LocalLanguageModel implements LanguageModel {
  async generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>> {
    const hasGlucoseContext = Boolean(params.context) && !params.context!.includes('Aún no tienes');

    if (!hasGlucoseContext) {
      return Result.ok(
        '¡Hola! Soy Gluco, tu acompañante en este camino. Todavía no veo registros recientes de glucosa. ' +
          '¿Quieres que te ayude a interpretar tus niveles, a planear una comida o a mantener hábitos saludables? ' +
          'Recuerda que no reemplazo la opinión de tu médico.',
      );
    }

    return Result.ok(
      `¡Gracias por compartirlo! Esto es lo que observo en tus datos recientes:\n\n${params.context}\n\n` +
        'Soy un apoyo para interpretar tendencias generales, no sustituyo a tu profesional de salud. ' +
        'Si tienes dudas sobre tratamiento, consulta con tu médico.',
    );
  }
}
