import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { ResetTokenInvalidError } from '../core/errors/ResetTokenInvalidError';
import { UserNotFoundError } from '../core/errors/UserNotFoundError';
import type { GetOneByEmailInterface } from './ports/GetOneByEmailInterface';
import type { UpdatePasswordInterface } from './ports/UpdatePasswordInterface';
import type { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import type { ResetCodeStoreInterface } from './ports/ResetCodeStoreInterface';
import { UserPassword } from '../../user/core/value-objects/UserPassword';

@Injectable()
export class ResetPassword {
  constructor(
    @Inject('GetOneByEmailUser')
    private readonly getOneByEmailUser: GetOneByEmailInterface,
    @Inject('UpdatePassword')
    private readonly updatePassword: UpdatePasswordInterface,
    @Inject('BcryptHasher')
    private readonly hasher: PasswordHasher,
    @Inject('ResetCodeStore')
    private readonly resetCodeStore: ResetCodeStoreInterface,
  ) {}

  async run(
    data: { email: string; code: string; password: string },
  ): Promise<Result<{ message: string }, ErrorAbstract>> {
    const passwordResult = UserPassword.create(data.password);
    if (!passwordResult.isValid) {
      return Result.fail(passwordResult.getError());
    }

    const codeValid = await this.resetCodeStore.verify(data.email, data.code);
    if (!codeValid) {
      return Result.fail(new ResetTokenInvalidError('El código de recuperación no es válido o ha expirado'));
    }

    await this.resetCodeStore.delete(data.email);

    const hashedPassword = await this.hasher.hash(data.password);

    const userResult = await this.getOneByEmailUser.run({ email: data.email });
    if (!userResult.isValid) {
      return Result.fail(new UserNotFoundError('Usuario no encontrado'));
    }

    const user = userResult.getValue().toPlain();
    const updateResult = await this.updatePassword.run(user.id, hashedPassword);
    if (!updateResult.isValid) {
      return Result.fail(updateResult.getError());
    }

    return Result.ok({ message: 'Contraseña restablecida exitosamente' });
  }
}
