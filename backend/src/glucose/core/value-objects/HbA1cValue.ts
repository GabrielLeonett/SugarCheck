import { Result } from '../../../shared/result';
import { HbA1cValueInvalidError } from '../errors/HbA1cValueInvalidError';

export class HbA1cValue {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Result<HbA1cValue, HbA1cValueInvalidError> {
    if (value <= 0 || value >= 20) {
      return Result.fail(
        new HbA1cValueInvalidError('El porcentaje de HbA1c debe estar entre 0.1 y 20%').withCode('HBA1C_VALUE_RANGE', 'valuePercent'),
      );
    }
    return Result.ok(new HbA1cValue(value));
  }
}
