import { ErrorAbstract } from 'src/shared/error-abstract';

export class UserNotFoundError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
