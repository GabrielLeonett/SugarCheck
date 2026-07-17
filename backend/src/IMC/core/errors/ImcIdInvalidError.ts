import { ErrorAbstract } from '../../../shared/error-abstract';

export class ImcIdInvalidError extends ErrorAbstract {
  constructor(message: string = 'El ID del IMC no es válido') {
    super(message);
  }
}
