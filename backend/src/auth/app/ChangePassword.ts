import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import type { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import type { UpdatePasswordInterface } from './ports/UpdatePasswordInterface';
import { UserPassword } from '../../user/core/value-objects/UserPassword';
import { User } from '../../user/core/User';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import { UserNotFoundError } from '../core/errors/UserNotFoundError';

interface GetOneByIdUserPort {
  run(data: { id: string }): Promise<Result<User, ErrorAbstract>>;
}

@Injectable()
export class ChangePassword {
  constructor(
    @Inject('GetOneByIdUser')
    private readonly getOneByIdUser: GetOneByIdUserPort,
    @Inject('BcryptHasher')
    private readonly hasher: PasswordHasher,
    @Inject('UpdatePassword')
    private readonly updatePassword: UpdatePasswordInterface,
  ) {}

  async run(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<Result<{ message: string }, ErrorAbstract>> {
    // 1. Validar la nueva contraseña contra las reglas de negocio
    const newPasswordRes = UserPassword.create(data.newPassword);
    if (!newPasswordRes.isValid) return Result.fail(newPasswordRes.getError());

    // 2. Obtener el usuario autenticado
    const userRes = await this.getOneByIdUser.run({ id: data.userId });
    if (!userRes.isValid) return Result.fail(new UserNotFoundError('Usuario no encontrado'));

    const user = userRes.getValue();

    // 3. Verificar la contraseña actual
    const isCurrentValid = await this.hasher.compare(data.currentPassword, user.password.value);
    if (!isCurrentValid) {
      return Result.fail(new InvalidCredentialsError('La contraseña actual es incorrecta'));
    }

    // 4. Hashear y persistir la nueva contraseña
    const hashedPassword = await this.hasher.hash(data.newPassword);
    const updateRes = await this.updatePassword.run(data.userId, hashedPassword);
    if (!updateRes.isValid) return Result.fail(updateRes.getError());

    return Result.ok({ message: 'Contraseña actualizada correctamente' });
  }
}
