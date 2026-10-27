import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserId } from '../../shared/core/value-objects/UserId';
import { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import { UserRepository } from '../core/UserRepository';
import { UserPassword } from '../core/value-objects/UserPassword';
import { UserPasswordInvalidError } from '../core/errors/UserPasswordInvalidError';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Cambia la contraseña de un usuario autenticado verificando primero
 * que la contraseña actual sea correcta.
 */
export class ChangePassword {
  constructor(
    private readonly repository: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  public async run(
    data: ChangePasswordInput,
  ): Promise<Result<void, ErrorAbstract>> {
    const idResult = UserId.create(data.userId);
    if (!idResult.isValid) return Result.fail(idResult.getError());

    if (!data.currentPassword || data.currentPassword.trim().length === 0) {
      return Result.fail(
        new UserPasswordInvalidError(
          'La contraseña actual es obligatoria.',
        ).withCode('PASSWORD_EMPTY', 'currentPassword'),
      );
    }

    const newPasswordResult = UserPassword.create(data.newPassword);
    if (!newPasswordResult.isValid) return Result.fail(newPasswordResult.getError());

    if (data.currentPassword === data.newPassword) {
      return Result.fail(
        new UserPasswordInvalidError(
          'La nueva contraseña debe ser diferente a la actual.',
        ).withCode('PASSWORD_SAME_AS_CURRENT', 'newPassword'),
      );
    }

    const userResult = await this.repository.getOneById(idResult.getValue());
    if (!userResult.isValid) return Result.fail(userResult.getError());

    const user = userResult.getValue();
    const currentPasswordMatches = await this.hasher.compare(
      data.currentPassword,
      user.password.value,
    );

    if (!currentPasswordMatches) {
      return Result.fail(
        new UserPasswordInvalidError(
          'La contraseña actual no es correcta.',
        ).withCode('PASSWORD_CURRENT_INVALID', 'currentPassword'),
      );
    }

    const hashedPassword = await this.hasher.hash(data.newPassword);
    return this.repository.updatePassword(user.id.value, hashedPassword);
  }
}
