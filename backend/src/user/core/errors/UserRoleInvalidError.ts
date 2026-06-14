import { ErrorAbstract } from '../../../shared/error-abstract';

export class UserRoleInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
