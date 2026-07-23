import { InsulinaRepository } from '../core/InsulinaRepository';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

export interface DailyTotals {
  totalRapida: number;
  totalLenta: number;
  totalGeneral: number;
}

export class GetTotalsInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(params: { userId: string; date: Date }): Promise<Result<DailyTotals, ErrorAbstract>> {
    const result = await this.repository.getTotalByUserIdAndDate(params.userId, params.date);
    if (!result.isValid) return Result.fail(result.getError());

    const totals = result.getValue();
    return Result.ok({
      totalRapida: totals.totalRapida,
      totalLenta: totals.totalLenta,
      totalGeneral: totals.totalRapida + totals.totalLenta,
    });
  }
}