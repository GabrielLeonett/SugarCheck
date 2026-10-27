import { ImcRepository } from '../core/ImcRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ImcNoEliminableError } from '../core/errors/ImcNoEliminableError';

export class DeleteImc {
  constructor(
    private readonly _repository: ImcRepository,
  ) {}

  public async run(_data: { id: string }): Promise<Result<void, ErrorAbstract>> {
    return Result.fail(new ImcNoEliminableError());
  }
}
