import { ErrorAbstract } from '../../../shared/error-abstract';

// 1. Error específico para el Email
export class PesoInvalidoError extends ErrorAbstract {
  constructor(
    message: string = 'El valor del peso no es válido',
  ) {
    super(message);
  }
}
