import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserNotFoundError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
