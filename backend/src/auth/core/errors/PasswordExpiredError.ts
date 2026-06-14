import { ErrorAbstract } from '../../../shared/error-abstract';

export class PasswordExpiredError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
