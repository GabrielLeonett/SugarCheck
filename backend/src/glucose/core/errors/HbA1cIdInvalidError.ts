import { ErrorAbstract } from '../../../shared/error-abstract';

export class HbA1cIdInvalidError extends ErrorAbstract {
  constructor(message: string = 'El ID de HbA1c no es válido') {
    super(message, { code: 'INVALID_HBA1C_ID' });
  }
}
