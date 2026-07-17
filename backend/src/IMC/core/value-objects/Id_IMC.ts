import { Result } from '../../../shared/result';
import { ImcIdInvalidError } from '../../core/errors/ImcIdInvalidError';

export class Id_IMC {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<Id_IMC, ImcIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new ImcIdInvalidError('El ID del IMC no puede estar vacío'),
      );
    }
    return Result.ok(new Id_IMC(value.trim()));
  }

  equals(other: Id_IMC): boolean {
    return this.value === other.value;
  }
}
