import { HbA1cRepository } from '../core/HbA1cRepository';
import { HbA1c } from '../core/HbA1c';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';

export class GetAllHbA1c {
  constructor(
    private readonly repository: HbA1cRepository,
  ) {}

  public async run(data: { userId: string }): Promise<Result<HbA1c[], ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return await this.repository.getAllByUserId(userIdRes.getValue());
  }
}
