import { Result } from '../../../shared/result';
import { ContextoAplicacionInvalidoError } from '../../../insulina/core/errors/ContextoAplicacionInvalidoError';

export enum ContextoAplicacionEnum {
  DESAYUNO = 'DESAYUNO',
  ALMUERZO = 'ALMUERZO',
  CENA = 'CENA',
  CORRECCION = 'CORRECCION',
  OTRO = 'OTRO',
}

const CONTEXTO_MAPPING: Record<string, ContextoAplicacionEnum> = {
  'DESAYUNO': ContextoAplicacionEnum.DESAYUNO,
  'ALMUERZO': ContextoAplicacionEnum.ALMUERZO,
  'CENA': ContextoAplicacionEnum.CENA,
  'CORRECCION': ContextoAplicacionEnum.CORRECCION,
  'CORRECCIÓN': ContextoAplicacionEnum.CORRECCION,
};

const CONTEXTO_LABELS: Record<ContextoAplicacionEnum, string> = {
  [ContextoAplicacionEnum.DESAYUNO]: 'Desayuno',
  [ContextoAplicacionEnum.ALMUERZO]: 'Almuerzo',
  [ContextoAplicacionEnum.CENA]: 'Cena',
  [ContextoAplicacionEnum.CORRECCION]: 'Corrección',
  [ContextoAplicacionEnum.OTRO]: 'Otro',
};

export class ContextoAplicacion {
  private readonly _contexto: ContextoAplicacionEnum;

  private constructor(contexto: ContextoAplicacionEnum) {
    this._contexto = contexto;
  }

  get contexto(): ContextoAplicacionEnum {
    return this._contexto;
  }

  public static create(value: string): Result<ContextoAplicacion, ContextoAplicacionInvalidoError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new ContextoAplicacionInvalidoError('El contexto de aplicación es requerido'));
    }
    const upper = value.toUpperCase();
    const contexto = CONTEXTO_MAPPING[upper];
    if (!contexto) {
      return Result.fail(new ContextoAplicacionInvalidoError(`Contexto de aplicación inválido: ${value}`));
    }
    return Result.ok(new ContextoAplicacion(contexto));
  }

  public getLabel(): string {
    return CONTEXTO_LABELS[this._contexto];
  }

  public equals(other: ContextoAplicacion): boolean {
    return this._contexto === other._contexto;
  }

  public toString(): string {
    return this._contexto;
  }
}