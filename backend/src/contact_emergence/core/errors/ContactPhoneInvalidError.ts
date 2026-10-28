import { ErrorAbstract } from '../../../shared/error-abstract';

export class ContactPhoneInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
