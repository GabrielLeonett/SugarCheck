import { InsulinaRepository } from '../core/InsulinaRepository';
import { IdInsulina } from '../core/value-objects/IdInsulina';
import { InsulinaNoEliminableError } from '../core/errors/InsulinaNoEliminableError';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

export class DeleteInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(_params: { id: string }): Promise<Result<void, ErrorAbstract>> {
    return Result.fail(new InsulinaNoEliminableError());
  }
}