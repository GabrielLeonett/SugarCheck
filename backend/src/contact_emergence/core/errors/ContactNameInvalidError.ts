import { ErrorAbstract } from '../../../shared/error-abstract';

export class ContactNameInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
