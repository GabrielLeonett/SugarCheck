import { ErrorAbstract } from '../../../shared/error-abstract';

// 1. Error específico para fechas
export class UserDateInvalidError extends ErrorAbstract {
  constructor(message: string = 'La fecha proporcionada no es válida') {
    super(message);
  }
}
