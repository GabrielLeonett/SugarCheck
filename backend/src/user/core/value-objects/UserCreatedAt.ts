import { UserDateInvalidError } from '../errors/UserDateInvalidError';
import { Result } from '../../../shared/result';

export class UserCreatedAt {
  public readonly value: Date;
  private constructor(value: Date) {
    this.value = value;
  }

  public static create(
    value: Date | string | number,
  ): Result<UserCreatedAt, UserDateInvalidError> {
    const date = new Date(value);

    // 1. Validación: ¿Es una fecha real? (Invalid Date check)
    if (isNaN(date.getTime())) {
      return Result.fail(
        new UserDateInvalidError('El formato de fecha es inválido'),
      );
    }

    // 2. Validación de negocio: No puede ser una fecha futura
    if (date > new Date()) {
      return Result.fail(
        new UserDateInvalidError(
          'La fecha de creación no puede estar en el futuro',
        ),
      );
    }

    return Result.ok(new UserCreatedAt(date));
  }
}
