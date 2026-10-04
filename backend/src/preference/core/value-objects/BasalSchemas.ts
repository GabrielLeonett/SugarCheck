import { Result } from '../../../shared/result';
import { BasalSchemaInvalidError } from '../errors/BasalSchemaInvalidError';

export interface BasalSchemaItem {
  injectionTime: string;
  dose: number;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class BasalSchemas {
  public readonly value: BasalSchemaItem[];

  private constructor(value: BasalSchemaItem[]) {
    this.value = value.map(item => ({ ...item }));
  }

  public static empty(): BasalSchemas {
    return new BasalSchemas([]);
  }

  public static create(
    value: BasalSchemaItem[] | null | undefined,
  ): Result<BasalSchemas, BasalSchemaInvalidError> {
    if (!value) {
      return Result.ok(new BasalSchemas([]));
    }

    if (!Array.isArray(value)) {
      return Result.fail(
        new BasalSchemaInvalidError('El esquema basal debe ser un arreglo').withCode('BASAL_SCHEMA_ARRAY', 'basalSchemas'),
      );
    }

    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item.dose !== 'number' || typeof item.injectionTime !== 'string') {
        return Result.fail(
          new BasalSchemaInvalidError(`El elemento ${i} tiene valores inválidos`).withCode('BASAL_SCHEMA_INVALID_ITEM', 'basalSchemas'),
        );
      }
      if (item.dose <= 0) {
        return Result.fail(
          new BasalSchemaInvalidError(`El elemento ${i} debe tener dosis positiva`).withCode('BASAL_SCHEMA_DOSE_POSITIVE', 'basalSchemas'),
        );
      }
      if (!TIME_REGEX.test(item.injectionTime)) {
        return Result.fail(
          new BasalSchemaInvalidError(`El elemento ${i} tiene formato de hora inválido (use HH:mm)`).withCode('BASAL_SCHEMA_TIME_FORMAT', 'basalSchemas'),
        );
      }
    }

    return Result.ok(new BasalSchemas(value));
  }
}
