import { Insulina } from '../core/Insulina';
import { InsulinaRepository } from '../core/InsulinaRepository';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

export class GetAllInsulinas {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(params: {
    userId: string;
    tipo?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Result<Insulina[], ErrorAbstract>> {
    let result: Insulina[];

    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      const res = await this.repository.getByUserIdAndDateRange(params.userId, start, end);
      if (!res.isValid) return Result.fail(res.getError());
      result = res.getValue();
    } else {
      const res = await this.repository.getAllByUserId(params.userId);
      if (!res.isValid) return Result.fail(res.getError());
      result = res.getValue();
    }

    if (params.tipo) {
      const tipoStr = params.tipo.toUpperCase();
      result = result.filter(r => r.tipo.toString() === tipoStr);
    }

    return Result.ok(result);
  }
}