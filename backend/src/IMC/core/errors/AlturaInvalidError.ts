import { ErrorAbstract } from '../../../shared/error-abstract';

// 1. Error específico para el Email
export class AlturaInvalidaError extends ErrorAbstract {
  constructor(
    message: string = 'El valor de la altura no es válido',
  ) {
    super(message);
  }
}
