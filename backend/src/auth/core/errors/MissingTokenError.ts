import { ErrorAbstract } from '../../../shared/error-abstract';

export class MissingTokenError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
