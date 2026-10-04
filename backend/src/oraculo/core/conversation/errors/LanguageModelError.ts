import { ErrorAbstract } from '../../../../shared/error-abstract';

export class LanguageModelError extends ErrorAbstract {
  constructor(message: string = 'No se pudo generar una respuesta en este momento') {
    super(message, { code: 'LANGUAGE_MODEL_ERROR', origin: 'external' });
  }
}
