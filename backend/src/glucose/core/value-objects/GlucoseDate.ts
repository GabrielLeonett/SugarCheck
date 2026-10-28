import { Result } from '../../../shared/result';
import { GlucoseDateInvalidError } from '../errors/GlucoseDateInvalidError';

export class GlucoseDate {
  public readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  public static create(value: Date | string): Result<GlucoseDate, GlucoseDateInvalidError> {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return Result.fail(new GlucoseDateInvalidError('La fecha de glucosa no es válida').withCode('GLUCOSE_DATE_INVALID', 'date'));
    }
    if (date > new Date()) {
      return Result.fail(new GlucoseDateInvalidError('La fecha de glucosa no puede estar en el futuro').withCode('GLUCOSE_DATE_FUTURE', 'date'));
    }
    return Result.ok(new GlucoseDate(date));
  }
}
