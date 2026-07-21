import { Result } from '../../../shared/result';
import { DosisInvalidaError } from '../../../insulina/core/errors/DosisInvalidaError';

export class Dosis {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  public static create(value: number): Result<Dosis, DosisInvalidaError> {
    if (value === undefined || value === null) {
      return Result.fail(new DosisInvalidaError('La dosis es requerida'));
    }
    if (typeof value !== 'number' || isNaN(value)) {
      return Result.fail(new DosisInvalidaError('La dosis debe ser un número'));
    }
    if (value <= 0) {
      return Result.fail(new DosisInvalidaError('La dosis debe ser mayor a 0'));
    }
    if (value > 100) {
      return Result.fail(new DosisInvalidaError('La dosis no puede ser mayor a 100 UI'));
    }
    if (!Number.isInteger(value * 2)) {
      return Result.fail(new DosisInvalidaError('La dosis debe ser en incrementos de 0.5 UI'));
    }
    return Result.ok(new Dosis(value));
  }

  public toString(): string {
    return `${this._value} UI`;
  }

  public equals(other: Dosis): boolean {
    return this._value === other._value;
  }
}