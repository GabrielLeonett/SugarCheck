import { ErrorAbstract } from 'src/shared/error-abstract';
import { UserId } from '../core/UserId';
import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { Result } from 'src/shared/result';

export class GetOneByIdUser {
  constructor(private readonly repository: UserRepository) {}

  public async run(id: string): Promise<Result<User | null, ErrorAbstract>> {
    const userIdResult = UserId.create(id);

    if (!userIdResult.isValid) {
      return Result.fail(userIdResult.getError());
    }

    const userId = userIdResult.getValue();

    return await this.repository.getOneById(userId);
  }
}
