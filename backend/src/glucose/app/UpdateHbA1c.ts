import { HbA1cRepository } from '../core/HbA1cRepository';
import { HbA1c } from '../core/HbA1c';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { HbA1cId } from '../core/value-objects/HbA1cId';
import { HbA1cValue } from '../core/value-objects/HbA1cValue';
import { HbA1cExamDate } from '../core/value-objects/HbA1cExamDate';
import { isWithinMedicalRecordEditWindow } from '../../shared/core/MedicalRecordEditWindow';
import { MedicalRecordNotEditableError } from '../../shared/core/errors/MedicalRecordNotEditableError';

export class UpdateHbA1c {
  constructor(
    private readonly repository: HbA1cRepository,
  ) {}

  async run(id: string, update: {
    valuePercent?: number;
    examDate?: Date | string;
  }): Promise<Result<HbA1c, ErrorAbstract>> {
    const idRes = HbA1cId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const hba1cId = idRes.getValue();

    const existingResult = await this.repository.getOneById(hba1cId);
    if (!existingResult.isValid) return existingResult;

    const existing = existingResult.getValue();

    if (!isWithinMedicalRecordEditWindow(existing.createdAt)) {
      return Result.fail(
        new MedicalRecordNotEditableError(
          'El período de edición de 15 días ha expirado para este examen HbA1c',
        ),
      );
    }

    const validatedUpdate: any = {};

    if (update.valuePercent !== undefined) {
      const valueRes = HbA1cValue.create(update.valuePercent);
      if (!valueRes.isValid) return Result.fail(valueRes.getError());
      validatedUpdate.valuePercent = valueRes.getValue();
    }

    if (update.examDate !== undefined) {
      const examDateRes = HbA1cExamDate.create(update.examDate);
      if (!examDateRes.isValid) return Result.fail(examDateRes.getError());
      validatedUpdate.examDate = examDateRes.getValue();
    }

    return await this.repository.update(hba1cId, validatedUpdate);
  }
}
