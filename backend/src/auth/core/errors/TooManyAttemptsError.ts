import { ErrorAbstract } from '../../../shared/error-abstract';

export class TooManyAttemptsError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
