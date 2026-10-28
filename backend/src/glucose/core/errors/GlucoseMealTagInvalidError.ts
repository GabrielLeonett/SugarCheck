import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseMealTagInvalidError extends ErrorAbstract {
  constructor(message: string = 'La etiqueta de comida no es válida') {
    super(message, { code: 'INVALID_MEAL_TAG' });
  }
}
