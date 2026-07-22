import { Result } from '../../../shared/result';
import { GlucoseValueInvalidError } from '../errors/GlucoseValueInvalidError';

export class GlucoseValue {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Result<GlucoseValue, GlucoseValueInvalidError> {
    if (value <= 0 || value >= 1000) {
      return Result.fail(
        new GlucoseValueInvalidError('El valor de glucosa debe estar entre 1 y 999 mg/dL').withCode('GLUCOSE_VALUE_RANGE', 'valueMgdl'),
      );
    }
    return Result.ok(new GlucoseValue(value));
  }
}
