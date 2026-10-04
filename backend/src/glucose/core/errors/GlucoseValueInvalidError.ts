import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseValueInvalidError extends ErrorAbstract {
  constructor(message: string = 'El valor de glucosa no es válido') {
    super(message, { code: 'INVALID_GLUCOSE_VALUE' });
  }
}
