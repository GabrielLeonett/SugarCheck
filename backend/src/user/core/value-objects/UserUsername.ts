import { Result } from '../../../shared/result';
import { UserUsernameInvalidError } from '../errors/UserUsernameInvalidError';

export class UserUsername {
  public readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<UserUsername, UserUsernameInvalidError> {
    const username = value ? value.trim() : '';

    if (!username || username.length < 3) {
      return Result.fail(
        new UserUsernameInvalidError('El nombre de usuario debe tener al menos 3 caracteres'),
      );
    }

    if (username.length > 30) {
      return Result.fail(
        new UserUsernameInvalidError('El nombre de usuario no puede exceder los 30 caracteres'),
      );
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!usernameRegex.test(username)) {
      return Result.fail(
        new UserUsernameInvalidError(
          'El nombre de usuario debe comenzar con una letra y solo puede contener letras, números, guiones y guiones bajos',
        ),
      );
    }

    return Result.ok(new UserUsername(username));
  }
}
