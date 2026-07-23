import { UserId } from '../../shared/core/value-objects/UserId';
import { Id_IMC } from './value-objects/Id_IMC';
import { Peso } from './value-objects/peso';
import { Altura } from './value-objects/altura';
import { Fecha } from './value-objects/Fecha';

interface ImcProps {
  id: Id_IMC;
  userId: UserId;
  peso: Peso;
  altura: Altura;
  fecha: Fecha;
}

export interface ImcPlain {
  id: string;
  userId: string;
  peso: number;
  altura: number;
  imcValue: number;
  categoria: string;
  fecha: string;
}

export class Imc {
  private readonly _id: Id_IMC;
  private readonly _userId: UserId;
  private _peso: Peso;
  private _altura: Altura;
  private _fecha: Fecha;
  private _imcValue: number;

  constructor(props: ImcProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._peso = props.peso;
    this._altura = props.altura;
    this._fecha = props.fecha;
    this._imcValue = this.calcularImc();
  }

  get id(): Id_IMC { return this._id; }
  get userId(): UserId { return this._userId; }
  get peso(): Peso { return this._peso; }
  get altura(): Altura { return this._altura; }
  get fecha(): Fecha { return this._fecha; }
  get imcValue(): number { return this._imcValue; }

  private calcularImc(): number {
    const pesoKg = this._peso.value;
    const alturaM = this._altura.value / 100;
    return pesoKg / (alturaM * alturaM);
  }

  getCategoria(): string {
    const imc = this._imcValue;
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad extrema';
  }

  actualizarPeso(nuevoPeso: Peso): void {
    this._peso = nuevoPeso;
    this._imcValue = this.calcularImc();
  }

  actualizarAltura(nuevaAltura: Altura): void {
    this._altura = nuevaAltura;
    this._imcValue = this.calcularImc();
  }

  public toPlain(): ImcPlain {
    return {
      id: this._id.value,
      userId: this._userId.value,
      peso: this._peso.value,
      altura: this._altura.value,
      imcValue: this._imcValue,
      categoria: this.getCategoria(),
      fecha: this._fecha.toISOString(),
    };
  }
}
