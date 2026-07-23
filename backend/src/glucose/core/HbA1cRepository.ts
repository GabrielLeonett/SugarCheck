import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { HbA1c } from './HbA1c';
import { HbA1cId } from './value-objects/HbA1cId';

export interface HbA1cRepository {
  getAllByUserId(userId: UserId): Promise<Result<HbA1c[], ErrorAbstract>>;

  getOneById(id: HbA1cId): Promise<Result<HbA1c, ErrorAbstract>>;

  save(hba1c: HbA1c): Promise<Result<HbA1c, ErrorAbstract>>;

  update(id: HbA1cId, update: Partial<HbA1c>): Promise<Result<HbA1c, ErrorAbstract>>;

  delete(id: HbA1cId): Promise<Result<void, ErrorAbstract>>;
}
