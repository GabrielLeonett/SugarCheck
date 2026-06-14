import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserAlreadyExists extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
