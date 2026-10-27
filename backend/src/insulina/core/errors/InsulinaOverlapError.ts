import { ErrorAbstract } from '../../../shared/error-abstract';

export class InsulinaOverlapError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
