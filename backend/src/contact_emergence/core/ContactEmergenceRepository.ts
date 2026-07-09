import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ContactEmergence } from './ContactEmergence';
import { ContactEmergenceId } from './value-objects/ContactEmergenceId';

export interface ContactEmergenceRepository {
  getAllByUserId(userId: UserId): Promise<Result<ContactEmergence[], ErrorAbstract>>;

  getOneById(id: ContactEmergenceId): Promise<Result<ContactEmergence, ErrorAbstract>>;

  save(contact: ContactEmergence): Promise<Result<ContactEmergence, ErrorAbstract>>;

  update(id: ContactEmergenceId, update: Partial<ContactEmergence>): Promise<Result<ContactEmergence, ErrorAbstract>>;

  delete(id: ContactEmergenceId): Promise<Result<void, ErrorAbstract>>;
}
