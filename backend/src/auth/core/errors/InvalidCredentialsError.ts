import { ErrorAbstract } from '../../../shared/error-abstract';

export class InvalidCredentialsError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
