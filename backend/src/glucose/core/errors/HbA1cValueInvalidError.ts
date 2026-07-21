import { ErrorAbstract } from '../../../shared/error-abstract';

export class HbA1cValueInvalidError extends ErrorAbstract {
  constructor(message: string = 'El valor de HbA1c no es válido') {
    super(message, { code: 'INVALID_HBA1C_VALUE' });
  }
}
