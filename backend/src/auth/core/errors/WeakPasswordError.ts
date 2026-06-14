import { ErrorAbstract } from '../../../shared/error-abstract';

export class WeakPasswordError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
