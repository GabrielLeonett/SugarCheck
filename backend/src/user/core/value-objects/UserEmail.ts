import { Result } from '../../../shared/result';
import { UserEmailInvalidError } from '../errors/UserEmailInvalidError';

export class UserEmail {
  public readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }

  public static create(
    value?: string | null,
  ): Result<UserEmail, UserEmailInvalidError> {
    if (!value || !value.trim()) {
      return Result.ok(new UserEmail(''));
    }

    const email = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Result.fail(
        new UserEmailInvalidError(
          `El correo "${email}" no tiene un formato válido`,
        ).withCode('EMAIL_INVALID_FORMAT', 'email'),
      );
    }

    return Result.ok(new UserEmail(email));
  }
}
