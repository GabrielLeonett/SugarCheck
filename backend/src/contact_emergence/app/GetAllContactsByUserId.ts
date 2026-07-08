import { ContactEmergenceRepository } from '../core/ContactEmergenceRepository';
import { ContactEmergence } from '../core/ContactEmergence';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';

export class GetAllContactsByUserId {
  constructor(
    private readonly repository: ContactEmergenceRepository,
  ) {}

  public async run(data: { userId: string }): Promise<Result<ContactEmergence[], ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return await this.repository.getAllByUserId(userIdRes.getValue());
  }
}
