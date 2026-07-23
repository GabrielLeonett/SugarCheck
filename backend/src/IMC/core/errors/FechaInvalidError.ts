import { ErrorAbstract } from '../../../shared/error-abstract';

// 1. Error específico para el Email
export class FechaInvalidaError extends ErrorAbstract {
  constructor(
    message: string = 'El formato de la fecha no es válido',
  ) {
    super(message);
  }
}
