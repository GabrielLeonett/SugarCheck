import { ContactEmergenceRepository } from '../core/ContactEmergenceRepository';
import { ContactEmergence } from '../core/ContactEmergence';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ContactEmergenceId } from '../core/value-objects/ContactEmergenceId';

export class GetOneContactById {
  constructor(
    private readonly repository: ContactEmergenceRepository,
  ) {}

  public async run(data: { id: string }): Promise<Result<ContactEmergence, ErrorAbstract>> {
    const idRes = ContactEmergenceId.create(data.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    return await this.repository.getOneById(idRes.getValue());
  }
}
