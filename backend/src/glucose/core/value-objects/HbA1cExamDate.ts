import { Result } from '../../../shared/result';
import { HbA1cExamDateInvalidError } from '../errors/HbA1cExamDateInvalidError';

export class HbA1cExamDate {
  public readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  public static create(value: Date | string): Result<HbA1cExamDate, HbA1cExamDateInvalidError> {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return Result.fail(new HbA1cExamDateInvalidError('La fecha del examen HbA1c no es válida').withCode('HBA1C_DATE_INVALID', 'examDate'));
    }
    if (date > new Date()) {
      return Result.fail(new HbA1cExamDateInvalidError('La fecha del examen no puede estar en el futuro').withCode('HBA1C_DATE_FUTURE', 'examDate'));
    }
    return Result.ok(new HbA1cExamDate(date));
  }
}
