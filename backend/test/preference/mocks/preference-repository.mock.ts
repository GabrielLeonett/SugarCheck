import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Preference } from '../../../src/preference/core/Preference';
import { PreferenceRepository } from '../../../src/preference/core/PreferenceRepository';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { DatabaseError } from '../../../src/shared/DatabaseError';

export class InMemoryPreferenceRepository implements PreferenceRepository {
  public items: Map<string, Preference> = new Map();

  async getOneById(id: UserId): Promise<Result<Preference, ErrorAbstract>> {
    const found = this.items.get(id.value);
    if (!found) {
      return Result.fail(new DatabaseError('Preferencia no encontrada'));
    }
    return Result.ok(found);
  }

  async save(
    preference: Preference,
  ): Promise<Result<Preference, ErrorAbstract>> {
    this.items.set(preference.userId.value, preference);
    return Result.ok(preference);
  }

  public clear(): void {
    this.items.clear();
  }
}
