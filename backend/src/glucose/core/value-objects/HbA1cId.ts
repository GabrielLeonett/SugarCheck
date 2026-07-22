import { Result } from '../../../shared/result';
import { HbA1cIdInvalidError } from '../errors/HbA1cIdInvalidError';

export class HbA1cId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<HbA1cId, HbA1cIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new HbA1cIdInvalidError('El ID de HbA1c no puede estar vacío').withCode('HBA1C_ID_EMPTY', 'id'));
    }
    return Result.ok(new HbA1cId(value.trim()));
  }

  equals(other: HbA1cId): boolean {
    return this.value === other.value;
  }
}
