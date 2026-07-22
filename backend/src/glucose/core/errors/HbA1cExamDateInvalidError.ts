import { ErrorAbstract } from '../../../shared/error-abstract';

export class HbA1cExamDateInvalidError extends ErrorAbstract {
  constructor(message: string = 'La fecha del examen HbA1c no es válida') {
    super(message, { code: 'INVALID_HBA1C_DATE' });
  }
}
