import { Result } from '../../../shared/result';
import { AlturaInvalidaError } from '../errors/AlturaInvalidError';

export class Altura {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Result<Altura, AlturaInvalidaError> {
    if (value <= 0 || value >= 280) {
      return Result.fail(
        new AlturaInvalidaError('La altura debe ser mayor que 0 y menor que 280'),
      );
    }
    return Result.ok(new Altura(value));
  }
}
