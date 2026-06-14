import { ErrorAbstract } from '../../../shared/error-abstract';

export class TokenRevokedError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
