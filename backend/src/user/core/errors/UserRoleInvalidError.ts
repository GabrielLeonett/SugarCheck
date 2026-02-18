import { ErrorAbstract } from 'src/shared/error-abstract';

export class UserRoleInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message);
  }
}
