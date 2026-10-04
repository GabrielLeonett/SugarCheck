import { Result } from '../../../shared/result';
import { IdInsulinaInvalidoError } from '../../../insulina/core/errors/IdInsulinaInvalidoError';
import { GenerateUUIDInterface } from '../../../shared/application/ports/generate-uuid.interface';

export class IdInsulina {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  public static create(value: string): Result<IdInsulina, IdInsulinaInvalidoError> {
    if (!value || typeof value !== 'string') {
      return Result.fail(new IdInsulinaInvalidoError());
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return Result.fail(new IdInsulinaInvalidoError());
    }
    return Result.ok(new IdInsulina(value));
  }

  public static generate(generator: GenerateUUIDInterface): IdInsulina {
    return new IdInsulina(generator.run());
  }

  public equals(other: IdInsulina): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}