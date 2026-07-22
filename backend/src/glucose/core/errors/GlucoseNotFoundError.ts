import { ErrorAbstract } from '../../../shared/error-abstract';

export class GlucoseNotFoundError extends ErrorAbstract {
  constructor(message: string = 'Registro de glucosa no encontrado') {
    super(message, { code: 'GLUCOSE_NOT_FOUND' });
  }
}
