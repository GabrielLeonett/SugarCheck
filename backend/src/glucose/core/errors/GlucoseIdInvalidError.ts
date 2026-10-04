import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseIdInvalidError extends ErrorAbstract {
  constructor(message: string = 'El ID de glucosa no es válido') {
    super(message, { code: 'INVALID_GLUCOSE_ID' });
  }
}
