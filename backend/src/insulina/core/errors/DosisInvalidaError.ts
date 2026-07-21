import { ErrorAbstract } from '../../../shared/error-abstract';

export class DosisInvalidaError extends ErrorAbstract {
  constructor(message: string) {
    super(message, {
      code: 'INVALID_DOSIS',
      field: 'dosis',
    });
  }
}