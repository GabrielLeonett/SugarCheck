import { ErrorAbstract } from '../../../shared/error-abstract';

export class ContactNotFoundError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
