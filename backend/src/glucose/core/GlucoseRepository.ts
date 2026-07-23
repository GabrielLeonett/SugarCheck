import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Glucose } from './Glucose';
import { GlucoseId } from './value-objects/GlucoseId';

export interface GlucoseRepository {
  getAllByUserId(userId: UserId): Promise<Result<Glucose[], ErrorAbstract>>;

  getOneById(id: GlucoseId): Promise<Result<Glucose, ErrorAbstract>>;

  save(glucose: Glucose): Promise<Result<Glucose, ErrorAbstract>>;

  update(id: GlucoseId, update: Partial<Glucose>): Promise<Result<Glucose, ErrorAbstract>>;

  delete(id: GlucoseId): Promise<Result<void, ErrorAbstract>>;
}
