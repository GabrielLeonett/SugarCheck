import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserUsernameInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
