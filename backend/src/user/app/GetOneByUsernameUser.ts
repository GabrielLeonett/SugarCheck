import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserUsername } from '../core/value-objects/UserUsername';

export class GetOneByUsernameUser {
  constructor(private readonly repository: UserRepository) {}
  public async run(data: {
    username: string;
  }): Promise<Result<User, ErrorAbstract>> {
    const username = UserUsername.create(data.username);

    if (!username.isValid) {
      return Result.fail(username.getError());
    }

    const usernameValid = username.getValue();

    return await this.repository.getOneByUsername(usernameValid);
  }
}
