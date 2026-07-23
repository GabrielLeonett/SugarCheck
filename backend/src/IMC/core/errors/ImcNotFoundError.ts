import { ErrorAbstract } from '../../../shared/error-abstract';

export class ImcNotFoundError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
