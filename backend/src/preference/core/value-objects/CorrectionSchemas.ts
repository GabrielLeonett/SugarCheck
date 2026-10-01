import { Result } from '../../../shared/result';
import { CorrectionSchemaInvalidError } from '../errors/CorrectionSchemaInvalidError';

export interface CorrectionSchemaItem {
  rangeMin: number;
  rangeMax: number;
  dose: number;
}

export class CorrectionSchemas {
  public readonly value: CorrectionSchemaItem[];

  private constructor(value: CorrectionSchemaItem[]) {
    this.value = value.map(item => ({ ...item }));
  }

  public static empty(): CorrectionSchemas {
    return new CorrectionSchemas([]);
  }

  public static create(
    value: CorrectionSchemaItem[] | null | undefined,
  ): Result<CorrectionSchemas, CorrectionSchemaInvalidError> {
    if (!value) {
      return Result.ok(new CorrectionSchemas([]));
    }

    if (!Array.isArray(value)) {
      return Result.fail(
        new CorrectionSchemaInvalidError('El esquema de corrección debe ser un arreglo').withCode('CORRECTION_SCHEMA_ARRAY', 'correctionSchemas'),
      );
    }

    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item.rangeMin !== 'number' || typeof item.rangeMax !== 'number' || typeof item.dose !== 'number') {
        return Result.fail(
          new CorrectionSchemaInvalidError(`El elemento ${i} tiene valores inválidos`).withCode('CORRECTION_SCHEMA_INVALID_ITEM', 'correctionSchemas'),
        );
      }
      if (item.rangeMin < 0 || item.rangeMax <= 0 || item.dose <= 0) {
        return Result.fail(
          new CorrectionSchemaInvalidError(`El elemento ${i} debe tener valores positivos`).withCode('CORRECTION_SCHEMA_POSITIVE', 'correctionSchemas'),
        );
      }
      if (item.rangeMin >= item.rangeMax) {
        return Result.fail(
          new CorrectionSchemaInvalidError(`El elemento ${i}: rangeMin debe ser menor a rangeMax`).withCode('CORRECTION_SCHEMA_RANGE', 'correctionSchemas'),
        );
      }
    }

    return Result.ok(new CorrectionSchemas(value));
  }
}
