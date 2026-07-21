import { Result } from '../../../shared/result';
import { TipoInsulinaInvalidoError } from '../../../insulina/core/errors/TipoInsulinaInvalidoError';

export enum TipoInsulinaEnum {
  RAPIDA = 'RAPIDA',
  LENTA = 'LENTA',
}

export class TipoInsulina {
  private readonly _tipo: TipoInsulinaEnum;

  private constructor(tipo: TipoInsulinaEnum) {
    this._tipo = tipo;
  }

  get tipo(): TipoInsulinaEnum {
    return this._tipo;
  }

  public static create(value: string): Result<TipoInsulina, TipoInsulinaInvalidoError> {
    const upper = value.toUpperCase();
    if (upper === 'RAPIDA' || upper === 'RÁPIDA' || upper === 'BOLUS') {
      return Result.ok(new TipoInsulina(TipoInsulinaEnum.RAPIDA));
    }
    if (upper === 'LENTA' || upper === 'BASAL') {
      return Result.ok(new TipoInsulina(TipoInsulinaEnum.LENTA));
    }
    return Result.fail(new TipoInsulinaInvalidoError(value));
  }

  public static createRapida(): TipoInsulina {
    return new TipoInsulina(TipoInsulinaEnum.RAPIDA);
  }

  public static createLenta(): TipoInsulina {
    return new TipoInsulina(TipoInsulinaEnum.LENTA);
  }

  public isRapida(): boolean {
    return this._tipo === TipoInsulinaEnum.RAPIDA;
  }

  public isLenta(): boolean {
    return this._tipo === TipoInsulinaEnum.LENTA;
  }

  public getLabel(): string {
    return this._tipo === TipoInsulinaEnum.RAPIDA ? 'Rápida / Bolus' : 'Lenta / Basal';
  }

  public getShortLabel(): string {
    return this._tipo === TipoInsulinaEnum.RAPIDA ? 'Rápida' : 'Lenta';
  }

  public equals(other: TipoInsulina): boolean {
    return this._tipo === other._tipo;
  }

  public toString(): string {
    return this._tipo;
  }
}