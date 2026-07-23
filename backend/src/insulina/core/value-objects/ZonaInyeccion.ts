import { Result } from '../../../shared/result';
import { ZonaInyeccionInvalidaError } from '../../../insulina/core/errors/ZonaInyeccionInvalidaError';

export enum ZonaInyeccionEnum {
  ABDOMEN_DERECHO = 'ABDOMEN_DERECHO',
  ABDOMEN_IZQUIERDO = 'ABDOMEN_IZQUIERDO',
  BRAZO_DERECHO = 'BRAZO_DERECHO',
  BRAZO_IZQUIERDO = 'BRAZO_IZQUIERDO',
  MUSLO_DERECHO = 'MUSLO_DERECHO',
  MUSLO_IZQUIERDO = 'MUSLO_IZQUIERDO',
  GLUTEO_DERECHO = 'GLUTEO_DERECHO',
  GLUTEO_IZQUIERDO = 'GLUTEO_IZQUIERDO',
}

const ZONA_MAPPING: Record<string, ZonaInyeccionEnum> = {
  'ABDOMEN DERECHO': ZonaInyeccionEnum.ABDOMEN_DERECHO,
  'ABDOMEN IZQUIERDO': ZonaInyeccionEnum.ABDOMEN_IZQUIERDO,
  'BRAZO DERECHO': ZonaInyeccionEnum.BRAZO_DERECHO,
  'BRAZO IZQUIERDO': ZonaInyeccionEnum.BRAZO_IZQUIERDO,
  'MUSLO DERECHO': ZonaInyeccionEnum.MUSLO_DERECHO,
  'MUSLO IZQUIERDO': ZonaInyeccionEnum.MUSLO_IZQUIERDO,
  'GLUTEO DERECHO': ZonaInyeccionEnum.GLUTEO_DERECHO,
  'GLUTEO IZQUIERDO': ZonaInyeccionEnum.GLUTEO_IZQUIERDO,
};

const ZONA_LABELS: Record<ZonaInyeccionEnum, string> = {
  [ZonaInyeccionEnum.ABDOMEN_DERECHO]: 'Abdomen Derecho',
  [ZonaInyeccionEnum.ABDOMEN_IZQUIERDO]: 'Abdomen Izquierdo',
  [ZonaInyeccionEnum.BRAZO_DERECHO]: 'Brazo Derecho',
  [ZonaInyeccionEnum.BRAZO_IZQUIERDO]: 'Brazo Izquierdo',
  [ZonaInyeccionEnum.MUSLO_DERECHO]: 'Muslo Derecho',
  [ZonaInyeccionEnum.MUSLO_IZQUIERDO]: 'Muslo Izquierdo',
  [ZonaInyeccionEnum.GLUTEO_DERECHO]: 'Glúteo Derecho',
  [ZonaInyeccionEnum.GLUTEO_IZQUIERDO]: 'Glúteo Izquierdo',
};

const FRENTE: ZonaInyeccionEnum[] = [
  ZonaInyeccionEnum.ABDOMEN_DERECHO,
  ZonaInyeccionEnum.ABDOMEN_IZQUIERDO,
  ZonaInyeccionEnum.MUSLO_DERECHO,
  ZonaInyeccionEnum.MUSLO_IZQUIERDO,
];

export class ZonaInyeccion {
  private readonly _zona: ZonaInyeccionEnum;

  private constructor(zona: ZonaInyeccionEnum) {
    this._zona = zona;
  }

  get zona(): ZonaInyeccionEnum {
    return this._zona;
  }

  public static create(value: string): Result<ZonaInyeccion, ZonaInyeccionInvalidaError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new ZonaInyeccionInvalidaError(value));
    }
    const upper = value.toUpperCase()
      .replace(/Á|á/g, 'A').replace(/É|é/g, 'E')
      .replace(/Í|í/g, 'I').replace(/Ó|ó/g, 'O')
      .replace(/Ú|ú/g, 'U').replace(/Ü|ü/g, 'U')
      .replace(/Ñ|ñ/g, 'N');

    const zona = ZONA_MAPPING[upper];
    if (!zona) {
      return Result.fail(new ZonaInyeccionInvalidaError(value));
    }
    return Result.ok(new ZonaInyeccion(zona));
  }

  public getLabel(): string {
    return ZONA_LABELS[this._zona];
  }

  public getVista(): 'FRENTE' | 'ATRAS' {
    return FRENTE.includes(this._zona) ? 'FRENTE' : 'ATRAS';
  }

  public getColor(): string {
    const colors: Record<ZonaInyeccionEnum, string> = {
      [ZonaInyeccionEnum.ABDOMEN_DERECHO]: '#ef4444',
      [ZonaInyeccionEnum.ABDOMEN_IZQUIERDO]: '#ef4444',
      [ZonaInyeccionEnum.BRAZO_DERECHO]: '#f97316',
      [ZonaInyeccionEnum.BRAZO_IZQUIERDO]: '#f97316',
      [ZonaInyeccionEnum.MUSLO_DERECHO]: '#f59e0b',
      [ZonaInyeccionEnum.MUSLO_IZQUIERDO]: '#f59e0b',
      [ZonaInyeccionEnum.GLUTEO_DERECHO]: '#22c55e',
      [ZonaInyeccionEnum.GLUTEO_IZQUIERDO]: '#22c55e',
    };
    return colors[this._zona];
  }

  public equals(other: ZonaInyeccion): boolean {
    return this._zona === other._zona;
  }

  public toString(): string {
    return this._zona;
  }
}