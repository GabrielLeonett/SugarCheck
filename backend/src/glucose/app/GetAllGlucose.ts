import { GlucoseRepository } from '../core/GlucoseRepository';
import { Glucose } from '../core/Glucose';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';

export class GetAllGlucose {
  constructor(
    private readonly repository: GlucoseRepository,
  ) {}

  public async run(data: { userId: string }): Promise<Result<Glucose[], ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return await this.repository.getAllByUserId(userIdRes.getValue());
  }
}
