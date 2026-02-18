import { Result } from 'src/shared/result';
import { UserEmailInvalidError } from './errors/UserEmailInvalidError';

export class UserEmail {
  public readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }

  public static create(
    value: string,
  ): Result<UserEmail, UserEmailInvalidError> {
    // 1. Limpieza básica
    const email = value ? value.trim().toLowerCase() : '';

    // 2. Expresión regular para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Result.fail(
        new UserEmailInvalidError(
          `El correo "${email}" no tiene un formato válido`,
        ),
      );
    }

    // 3. Si todo está bien, retornamos la instancia
    return Result.ok(new UserEmail(email));
  }
}
