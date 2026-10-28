import { Insulina } from './Insulina';
import { IdInsulina } from './value-objects/IdInsulina';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

export interface InsulinaRepository {
  getAllByUserId(userId: string): Promise<Result<Insulina[], ErrorAbstract>>;
  getById(id: IdInsulina): Promise<Result<Insulina | null, ErrorAbstract>>;
  save(insulina: Insulina): Promise<Result<Insulina, ErrorAbstract>>;
  update(id: IdInsulina, data: Partial<Insulina>): Promise<Result<Insulina, ErrorAbstract>>;
  delete(id: IdInsulina): Promise<Result<void, ErrorAbstract>>;
  getByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Result<Insulina[], ErrorAbstract>>;
  getTotalByUserIdAndDate(userId: string, date: Date): Promise<Result<{ totalRapida: number; totalLenta: number }, ErrorAbstract>>;
}