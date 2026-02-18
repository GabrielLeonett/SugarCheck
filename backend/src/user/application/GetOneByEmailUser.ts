import { Result } from 'src/shared/result';
import { UserEmail } from '../core/UserEmail';
import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { ErrorAbstract } from 'src/shared/error-abstract';

export class GetOneByEmailUser {
  constructor(private readonly repository: UserRepository) {}
  public async run(email: string): Promise<Result<User | null, ErrorAbstract>> {
    const emailUser = UserEmail.create(email);

    if (!emailUser.isValid) {
      return Result.fail(emailUser.getError());
    }

    const emailValid = emailUser.getValue();

    return await this.repository.getOneByEmail(emailValid);
  }
}
