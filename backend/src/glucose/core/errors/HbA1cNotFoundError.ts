import { ErrorAbstract } from '../../../shared/error-abstract';

export class HbA1cNotFoundError extends ErrorAbstract {
  constructor(message: string = 'Examen HbA1c no encontrado') {
    super(message, { code: 'HBA1C_NOT_FOUND' });
  }
}
