import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserPasswordInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
