import { ErrorAbstract } from '../../../shared/error-abstract';

export class FechaInsulinaInvalidaError extends ErrorAbstract {
  constructor(message: string) {
    super(message, {
      code: 'INVALID_DATE',
      field: 'fecha',
    });
  }
}