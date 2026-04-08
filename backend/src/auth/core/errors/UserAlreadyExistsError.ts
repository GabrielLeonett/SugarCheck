import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserAlreadyExistsError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
