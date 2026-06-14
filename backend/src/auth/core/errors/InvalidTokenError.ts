import { ErrorAbstract } from '../../../shared/error-abstract';

export class InvalidTokenError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
