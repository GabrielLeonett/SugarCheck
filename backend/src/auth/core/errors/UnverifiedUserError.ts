import { ErrorAbstract } from '../../../shared/error-abstract';

export class UnverifiedUserError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
