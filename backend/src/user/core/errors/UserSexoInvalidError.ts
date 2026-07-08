import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserSexoInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
