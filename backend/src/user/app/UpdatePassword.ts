import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserRepository } from '../core/UserRepository';
import { UserId } from '../../shared/core/value-objects/UserId';
import { UserPasswordInvalidError } from '../core/errors/UserPasswordInvalidError';

/**
 * Caso de uso para actualizar únicamente la contraseña de un usuario.
 * Recibe la contraseña ya hasheada (el hasheo es responsabilidad del caso de uso que lo invoca).
 */
export class UpdatePassword {
  constructor(private readonly repository: UserRepository) {}

  public async run(
    id: string,
    hashedPassword: string,
  ): Promise<Result<void, ErrorAbstract>> {
    const idResult = UserId.create(id);
    if (!idResult.isValid) return Result.fail(idResult.getError());

    if (!hashedPassword || hashedPassword.trim().length === 0) {
      return Result.fail(
        new UserPasswordInvalidError('La contraseña no puede estar vacía.'),
      );
    }

    return await this.repository.updatePassword(id, hashedPassword);
  }
}
