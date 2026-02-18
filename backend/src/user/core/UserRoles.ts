import { Result } from 'src/shared/result';
import { UserRoleInvalidError } from './errors/UserRoleInvalidError';

export type UserRoleType = 'Profesores' | 'Coordinadores' | 'Estudiantes';

export class UserRoles {
  public readonly value: string[];
  private constructor(value: UserRoleType[]) {
    this.value = value;
  }

  public static create(
    values: string[],
  ): Result<UserRoles, UserRoleInvalidError> {
    const validRoles: string[] = ['Profesores', 'Coordinadores', 'Estudiantes'];

    // 1. Validar que no sea un array vacío (regla de negocio opcional)
    if (!values || values.length === 0) {
      return Result.fail(
        new UserRoleInvalidError('El usuario debe tener al menos un rol.'),
      );
    }

    // 2. Validar que CADA rol enviado esté en la lista permitida
    for (const role of values) {
      if (!validRoles.includes(role)) {
        return Result.fail(
          new UserRoleInvalidError(
            `El rol "${role}" no es válido. Opciones: ${validRoles.join(', ')}`,
          ),
        );
      }
    }

    // 3. Eliminar duplicados (por si envían ['Estudiantes', 'Estudiantes'])
    const uniqueRoles = [...new Set(values)] as UserRoleType[];

    return Result.ok(new UserRoles(uniqueRoles));
  }

  // Método helper útil para el dominio
  public hasRole(role: UserRoleType): boolean {
    return this.value.includes(role);
  }
}
