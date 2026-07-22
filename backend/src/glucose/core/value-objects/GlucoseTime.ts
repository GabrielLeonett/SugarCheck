import { Result } from '../../../shared/result';
import { GlucoseTimeInvalidError } from '../errors/GlucoseTimeInvalidError';

export class GlucoseTime {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<GlucoseTime, GlucoseTimeInvalidError> {
    const regex = /^\d{2}:\d{2}$/;
    if (!value || !regex.test(value)) {
      return Result.fail(new GlucoseTimeInvalidError('La hora debe tener formato HH:mm').withCode('GLUCOSE_TIME_FORMAT', 'time'));
    }
    const [h, m] = value.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      return Result.fail(new GlucoseTimeInvalidError('La hora debe ser un valor válido entre 00:00 y 23:59').withCode('GLUCOSE_TIME_RANGE', 'time'));
    }
    return Result.ok(new GlucoseTime(value));
  }
}
