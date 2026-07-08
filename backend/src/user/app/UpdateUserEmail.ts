import { UserRepository } from '../core/UserRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserEmail } from '../core/value-objects/UserEmail';
import { UserId } from '../../shared/core/value-objects/UserId';
import { UserAlreadyExists } from '../core/errors/UserAlreadyExists';
import { UserNotFoundError } from '../core/errors/UserNotFoundError';

export class UpdateUserEmail {
  constructor(private readonly repository: UserRepository) {}

  public async run(data: {
    id: string;
    email: string;
  }): Promise<Result<boolean, ErrorAbstract>> {
    const idResult = UserId.create(data.id);
    if (!idResult.isValid) return Result.fail(idResult.getError());

    const emailResult = UserEmail.create(data.email);
    if (!emailResult.isValid) return Result.fail(emailResult.getError());

    const existingUser = await this.repository.getOneByEmail(emailResult.getValue());
    if (existingUser.isValid) {
      return Result.fail(
        new UserAlreadyExists('Este correo electrónico ya está registrado'),
      );
    }

    const userResult = await this.repository.getOneById(idResult.getValue());
    if (!userResult.isValid) {
      return Result.fail(new UserNotFoundError('Usuario no encontrado'));
    }

    const user = userResult.getValue();

    const updateResult = await this.repository.update(idResult.getValue(), {
      email: emailResult.getValue(),
    } as any);

    if (!updateResult.isValid) {
      return Result.fail(updateResult.getError());
    }

    return Result.ok(true);
  }
}
