import { ContactEmergenceRepository } from '../core/ContactEmergenceRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ContactEmergenceId } from '../core/value-objects/ContactEmergenceId';

export class DeleteContactEmergence {
  constructor(
    private readonly repository: ContactEmergenceRepository,
  ) {}

  public async run(data: { id: string }): Promise<Result<void, ErrorAbstract>> {
    const idRes = ContactEmergenceId.create(data.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    return await this.repository.delete(idRes.getValue());
  }
}
