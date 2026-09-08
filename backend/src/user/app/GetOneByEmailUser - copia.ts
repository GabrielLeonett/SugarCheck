import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserEmail } from '../core/value-objects/UserEmail';

export class GetOneByEmailUser {
  constructor(private readonly repository: UserRepository) {}
  public async run(data: {
    email: string;
  }): Promise<Result<User, ErrorAbstract>> {
    const emailUser = UserEmail.create(data.email);

    if (!emailUser.isValid) {
      return Result.fail(emailUser.getError());
    }

    const emailValid = emailUser.getValue();

    return await this.repository.getOneByEmail(emailValid);
  }
}
