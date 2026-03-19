import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserRepository } from '../core/UserRepository';
import { UserId } from '../core/value-objects/UserId';

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
