import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ContactEmergence } from './ContactEmergence';

export interface PreferenceRepository {
  getOneById(id: UserId): Promise<Result<ContactEmergence, ErrorAbstract>>;

  save(userConfig: ContactEmergence): Promise<Result<ContactEmergence, ErrorAbstract>>;
}
