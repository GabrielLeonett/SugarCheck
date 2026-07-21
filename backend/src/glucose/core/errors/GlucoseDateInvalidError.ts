import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseDateInvalidError extends ErrorAbstract {
  constructor(message: string = 'La fecha de glucosa no es válida') {
    super(message, { code: 'INVALID_GLUCOSE_DATE' });
  }
}
