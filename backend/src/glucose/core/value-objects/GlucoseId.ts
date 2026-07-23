import { Result } from '../../../shared/result';
import { GlucoseIdInvalidError } from '../errors/GlucoseIdInvalidError';

export class GlucoseId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<GlucoseId, GlucoseIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new GlucoseIdInvalidError('El ID de glucosa no puede estar vacío').withCode('GLUCOSE_ID_EMPTY', 'id'));
    }
    return Result.ok(new GlucoseId(value.trim()));
  }

  equals(other: GlucoseId): boolean {
    return this.value === other.value;
  }
}
