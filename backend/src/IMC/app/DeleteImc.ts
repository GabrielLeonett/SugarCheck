import { ImcRepository } from '../core/ImcRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Id_IMC } from '../core/value-objects/Id_IMC';

export class DeleteImc {
  constructor(
    private readonly repository: ImcRepository,
  ) {}

  public async run(data: { id: string }): Promise<Result<void, ErrorAbstract>> {
    const idRes = Id_IMC.create(data.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    return await this.repository.delete(idRes.getValue());
  }
}
