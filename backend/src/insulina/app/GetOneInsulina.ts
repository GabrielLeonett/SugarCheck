import { Insulina } from '../core/Insulina';
import { InsulinaRepository } from '../core/InsulinaRepository';
import { IdInsulina } from '../core/value-objects/IdInsulina';
import { InsulinaNotFoundError } from '../core/errors/InsulinaNotFoundError';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

export class GetOneInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(params: { id: string }): Promise<Result<Insulina, ErrorAbstract>> {
    const idRes = IdInsulina.create(params.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const result = await this.repository.getById(idRes.getValue());
    if (!result.isValid) return Result.fail(result.getError());

    const insulina = result.getValue();
    if (!insulina) {
      return Result.fail(new InsulinaNotFoundError(params.id));
    }

    return Result.ok(insulina);
  }
}