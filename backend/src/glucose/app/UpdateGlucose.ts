import { GlucoseRepository } from '../core/GlucoseRepository';
import { Glucose } from '../core/Glucose';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { GlucoseId } from '../core/value-objects/GlucoseId';
import { GlucoseValue } from '../core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../core/value-objects/GlucoseMealTag';
import { EditWindowExpiredError } from '../core/errors/EditWindowExpiredError';

const EDIT_WINDOW_DAYS = 15;

export class UpdateGlucose {
  constructor(
    private readonly repository: GlucoseRepository,
  ) {}

  async run(id: string, update: {
    valueMgdl?: number;
    mealTag?: string;
  }): Promise<Result<Glucose, ErrorAbstract>> {
    const idRes = GlucoseId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const glucoseId = idRes.getValue();

    const existingResult = await this.repository.getOneById(glucoseId);
    if (!existingResult.isValid) return existingResult;

    const existing = existingResult.getValue();
    const now = new Date();
    const diffMs = now.getTime() - existing.createdAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > EDIT_WINDOW_DAYS) {
      return Result.fail(
        new EditWindowExpiredError('El período de edición de 15 días ha expirado para este registro de glucosa'),
      );
    }

    const validatedUpdate: any = {};

    if (update.valueMgdl !== undefined) {
      const valueRes = GlucoseValue.create(update.valueMgdl);
      if (!valueRes.isValid) return Result.fail(valueRes.getError());
      validatedUpdate.valueMgdl = valueRes.getValue();
    }

    if (update.mealTag !== undefined) {
      const mealTagRes = GlucoseMealTag.create(update.mealTag);
      if (!mealTagRes.isValid) return Result.fail(mealTagRes.getError());
      validatedUpdate.mealTag = mealTagRes.getValue();
    }

    return await this.repository.update(glucoseId, validatedUpdate);
  }
}
