import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseTimeInvalidError extends ErrorAbstract {
  constructor(message: string = 'La hora de glucosa no es válida') {
    super(message, { code: 'INVALID_GLUCOSE_TIME' });
  }
}
