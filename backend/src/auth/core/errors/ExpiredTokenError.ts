import { ErrorAbstract } from '../../../shared/error-abstract';

export class ExpiredTokenError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
