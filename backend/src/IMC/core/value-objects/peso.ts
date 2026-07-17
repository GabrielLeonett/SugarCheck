import { Result } from '../../../shared/result';
import { PesoInvalidoError } from '../errors/PesocInvalidError';

export class Peso {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Result<Peso, PesoInvalidoError> {
    if (value <= 0 || value >= 700) {
      return Result.fail(
        new PesoInvalidoError('El peso debe ser mayor que 0 y menor que 700'),
      );
    }
    return Result.ok(new Peso(value));
  }
}
