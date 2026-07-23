import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Imc } from './Imc';
import { Id_IMC } from './value-objects/Id_IMC';

export interface ImcRepository {
  getAllByUserId(userId: UserId): Promise<Result<Imc[], ErrorAbstract>>;

  getOneById(id: Id_IMC): Promise<Result<Imc, ErrorAbstract>>;

  save(imc: Imc): Promise<Result<Imc, ErrorAbstract>>;

  update(id: Id_IMC, update: Partial<Imc>): Promise<Result<Imc, ErrorAbstract>>;

  delete(id: Id_IMC): Promise<Result<void, ErrorAbstract>>;
}
