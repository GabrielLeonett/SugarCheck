import { UserId } from '../core/UserId';
import { UserRepository } from '../core/UserRepository';
import { Result } from 'src/shared/result';
import { ErrorAbstract } from 'src/shared/error-abstract';

export class DeleteUser {
  constructor(private readonly repository: UserRepository) {}

  public async run(id: string): Promise<Result<void, ErrorAbstract>> {
    const userIdResult = UserId.create(id);

    if (!userIdResult.isValid) {
      return Result.fail(userIdResult.getError());
    }

    const userId = userIdResult.getValue();

    return await this.repository.delete(userId);
  }
}
