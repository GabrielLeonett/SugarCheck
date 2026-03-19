import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserId } from '../core/value-objects/UserId';

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
