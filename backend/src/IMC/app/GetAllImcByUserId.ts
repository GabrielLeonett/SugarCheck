import { ImcRepository } from '../core/ImcRepository';
import { Imc } from '../core/Imc';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';

export class GetAllImcByUserId {
  constructor(
    private readonly repository: ImcRepository,
  ) {}

  public async run(data: { userId: string }): Promise<Result<Imc[], ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return await this.repository.getAllByUserId(userIdRes.getValue());
  }
}
