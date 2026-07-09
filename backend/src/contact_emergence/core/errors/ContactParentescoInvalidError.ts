import { ErrorAbstract } from '../../../shared/error-abstract';

export class ContactParentescoInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
