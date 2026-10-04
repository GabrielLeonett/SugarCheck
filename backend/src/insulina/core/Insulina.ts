import { IdInsulina } from './value-objects/IdInsulina';
import { TipoInsulina } from './value-objects/TipoInsulina';
import { Dosis } from './value-objects/Dosis';
import { ZonaInyeccion } from './value-objects/ZonaInyeccion';
import { ContextoAplicacion } from './value-objects/ContextoAplicacion';
import { FechaInsulina } from './value-objects/FechaInsulina';
import { HoraInsulina } from './value-objects/HoraInsulina';

export interface InsulinaPlain {
  id: string;
  userId: string;
  tipo: string;
  unidades: number;
  dosis: number;
  fecha: string;
  hora: string;
  zona: string;
  zonaLabel: string;
  contexto: string | null;
  contextoLabel: string | null;
  createdAt: string;
}

export class Insulina {
  private readonly _id: IdInsulina;
  private readonly _userId: string;
  private readonly _tipo: TipoInsulina;
  private _dosis: Dosis;
  private _fecha: FechaInsulina;
  private _hora: HoraInsulina;
  private _zona: ZonaInyeccion;
  private _contexto: ContextoAplicacion | null;
  private readonly _createdAt: Date;

  constructor(props: {
    id: IdInsulina;
    userId: string;
    tipo: TipoInsulina;
    dosis: Dosis;
    fecha: FechaInsulina;
    hora: HoraInsulina;
    zona: ZonaInyeccion;
    contexto: ContextoAplicacion | null;
    createdAt?: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._tipo = props.tipo;
    this._dosis = props.dosis;
    this._fecha = props.fecha;
    this._hora = props.hora;
    this._zona = props.zona;
    this._contexto = props.contexto;
    this._createdAt = props.createdAt || new Date();
  }

  get id(): IdInsulina { return this._id; }
  get userId(): string { return this._userId; }
  get tipo(): TipoInsulina { return this._tipo; }
  get dosis(): Dosis { return this._dosis; }
  get fecha(): FechaInsulina { return this._fecha; }
  get hora(): HoraInsulina { return this._hora; }
  get zona(): ZonaInyeccion { return this._zona; }
  get contexto(): ContextoAplicacion | null { return this._contexto; }
  get createdAt(): Date { return new Date(this._createdAt); }

  public actualizarDosis(nuevaDosis: Dosis): void {
    this._dosis = nuevaDosis;
  }

  public actualizarFecha(nuevaFecha: FechaInsulina): void {
    this._fecha = nuevaFecha;
  }

  public actualizarHora(nuevaHora: HoraInsulina): void {
    this._hora = nuevaHora;
  }

  public actualizarZona(nuevaZona: ZonaInyeccion): void {
    this._zona = nuevaZona;
  }

  public actualizarContexto(nuevoContexto: ContextoAplicacion | null): void {
    if (this._tipo.isRapida() && !nuevoContexto) {
      throw new Error('La insulina rápida requiere un contexto de aplicación');
    }
    this._contexto = nuevoContexto;
  }

  public toPlain(): InsulinaPlain {
    return {
      id: this._id.value,
      userId: this._userId,
      tipo: this._tipo.toString(),
      unidades: this._dosis.value,
      dosis: this._dosis.value,
      fecha: this._fecha.toISOString(),
      hora: this._hora.toString(),
      zona: this._zona.toString(),
      zonaLabel: this._zona.getLabel(),
      contexto: this._contexto?.toString() || null,
      contextoLabel: this._contexto?.getLabel() || null,
      createdAt: this._createdAt.toISOString(),
    };
  }
}