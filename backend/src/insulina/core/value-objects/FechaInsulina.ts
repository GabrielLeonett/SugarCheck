import { Result } from '../../../shared/result';
import { FechaInsulinaInvalidaError } from '../../../insulina/core/errors/FechaInsulinaInvalidaError';

export class FechaInsulina {
  private readonly _date: Date;

  private constructor(date: Date) {
    this._date = date;
  }

  get value(): Date {
    return new Date(this._date);
  }

  get dia(): number {
    return this._date.getDate();
  }

  get mes(): number {
    return this._date.getMonth() + 1;
  }

  get anio(): number {
    return this._date.getFullYear();
  }

  public static create(dia: number, mes: number, anio: number): Result<FechaInsulina, FechaInsulinaInvalidaError> {
    if (!dia || !mes || !anio) {
      return Result.fail(new FechaInsulinaInvalidaError('Día, mes y año son requeridos'));
    }
    if (dia < 1 || dia > 31) {
      return Result.fail(new FechaInsulinaInvalidaError('Día inválido'));
    }
    if (mes < 1 || mes > 12) {
      return Result.fail(new FechaInsulinaInvalidaError('Mes inválido'));
    }
    if (anio < 2000 || anio > 2100) {
      return Result.fail(new FechaInsulinaInvalidaError('Año inválido'));
    }
    const date = new Date(anio, mes - 1, dia);
    if (date.getDate() !== dia || date.getMonth() + 1 !== mes || date.getFullYear() !== anio) {
      return Result.fail(new FechaInsulinaInvalidaError('Fecha inválida'));
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date > now) {
      return Result.fail(new FechaInsulinaInvalidaError('La fecha no puede ser futura'));
    }
    return Result.ok(new FechaInsulina(date));
  }

  public static fromDate(date: Date): FechaInsulina {
    return new FechaInsulina(date);
  }

  public toISOString(): string {
    return this._date.toISOString();
  }

  public equals(other: FechaInsulina): boolean {
    return this._date.getTime() === other._date.getTime();
  }

  public isSameDay(other: FechaInsulina): boolean {
    return (
      this._date.getDate() === other._date.getDate() &&
      this._date.getMonth() === other._date.getMonth() &&
      this._date.getFullYear() === other._date.getFullYear()
    );
  }
}