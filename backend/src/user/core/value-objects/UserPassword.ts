import { Result } from '../../../shared/result';
import { UserPasswordInvalidError } from '../errors/UserPasswordInvalidError';

export class UserPassword {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(
    password: string,
  ): Result<UserPassword, UserPasswordInvalidError> {
    // 1. Validar que no sea nula o vacía
    if (!password || password.trim().length === 0) {
      return Result.fail(
        new UserPasswordInvalidError('La contraseña no puede estar vacía.'),
      );
    }

    // 2. Regla de negocio: Longitud mínima (ejemplo: 8 caracteres)
    if (password.length < 8) {
      return Result.fail(
        new UserPasswordInvalidError(
          'La contraseña debe tener al menos 8 caracteres.',
        ),
      );
    }

    // 3. Regla opcional: Validar complejidad (al menos un número)
    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      return Result.fail(
        new UserPasswordInvalidError(
          'La contraseña debe incluir al menos un número.',
        ),
      );
    }

    // Si pasa las reglas, creamos el objeto
    return Result.ok(new UserPassword(password));
  }

  /**
   * Método útil para cuando necesites comparar contraseñas
   * (aunque usualmente esto se hace con un servicio de encriptación)
   */
  public equals(otherPassword: string): boolean {
    return this.value === otherPassword;
  }
}
