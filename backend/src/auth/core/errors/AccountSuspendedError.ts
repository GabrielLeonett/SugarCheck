import { ErrorAbstract } from '../../../shared/error-abstract';

export class AccountSuspendedError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
