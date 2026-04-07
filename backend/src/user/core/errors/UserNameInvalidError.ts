import { ErrorAbstract } from '../../../shared/error-abstract';

// Definimos un error específico para este Value Object
export class UserNameInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
