import { GlucoseRepository } from '../core/GlucoseRepository';
import { Glucose } from '../core/Glucose';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { GlucoseId } from '../core/value-objects/GlucoseId';
import { GlucoseValue } from '../core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../core/value-objects/GlucoseMealTag';
import { GlucoseDate } from '../core/value-objects/GlucoseDate';
import { GlucoseTime } from '../core/value-objects/GlucoseTime';
import { isWithinMedicalRecordEditWindow } from '../../shared/core/MedicalRecordEditWindow';
import { MedicalRecordNotEditableError } from '../../shared/core/errors/MedicalRecordNotEditableError';

export class UpdateGlucose {
  constructor(
    private readonly repository: GlucoseRepository,
  ) {}

  async run(id: string, update: {
    valueMgdl?: number;
    mealTag?: string;
    date?: Date | string;
    time?: string;
  }): Promise<Result<Glucose, ErrorAbstract>> {
    const idRes = GlucoseId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const glucoseId = idRes.getValue();

    const existingResult = await this.repository.getOneById(glucoseId);
    if (!existingResult.isValid) return existingResult;

    const existing = existingResult.getValue();

    if (!isWithinMedicalRecordEditWindow(existing.createdAt)) {
      return Result.fail(
        new MedicalRecordNotEditableError(
          'El período de edición de 15 días ha expirado para este registro de glucosa',
        ),
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

    if (update.date !== undefined) {
      const dateRes = GlucoseDate.create(update.date);
      if (!dateRes.isValid) return Result.fail(dateRes.getError());
      validatedUpdate.date = dateRes.getValue();
    }

    if (update.time !== undefined) {
      const timeRes = GlucoseTime.create(update.time);
      if (!timeRes.isValid) return Result.fail(timeRes.getError());
      validatedUpdate.time = timeRes.getValue();
    }

    return await this.repository.update(glucoseId, validatedUpdate);
  }
}
