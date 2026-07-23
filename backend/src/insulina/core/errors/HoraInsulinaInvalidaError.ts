import { ErrorAbstract } from '../../../shared/error-abstract';

export class HoraInsulinaInvalidaError extends ErrorAbstract {
  constructor(message: string) {
    super(message, {
      code: 'INVALID_TIME',
      field: 'hora',
    });
  }
}