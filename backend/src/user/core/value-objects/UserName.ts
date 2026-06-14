import { Result } from '../../../shared/result';
import { UserNameInvalidError } from '../errors/UserNameInvalidError';

export class UserName {
  public readonly value: string;
  // El constructor recibe el valor y se lo pasa a la clase base
  private constructor(value: string) {
    this.value = value;
  }

  // El método estático es la única puerta de entrada
  public static create(value: string): Result<UserName, UserNameInvalidError> {
    // 1. Validaciones de negocio
    if (!value || value.trim().length < 3) {
      return Result.fail(
        new UserNameInvalidError('El nombre debe tener al menos 3 caracteres'),
      );
    }

    if (value.length > 50) {
      return Result.fail(
        new UserNameInvalidError(
          'El nombre no puede exceder los 50 caracteres',
        ),
      );
    }

    // 2. Si todo está bien, retornamos la instancia
    return Result.ok(new UserName(value.trim()));
  }
}
