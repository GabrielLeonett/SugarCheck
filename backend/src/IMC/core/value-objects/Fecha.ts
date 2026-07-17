import { Result } from '../../../shared/result';
import { FechaInvalidaError } from '../errors/FechaInvalidError';

export class Fecha {
  public readonly dia: number;
  public readonly mes: number;
  public readonly anio: number;
  public readonly valor: Date;

  private constructor(dia: number, mes: number, anio: number) {
    this.dia = dia;
    this.mes = mes;
    this.anio = anio;

    const fecha = new Date(anio, mes - 1, dia);
    const esValida =
      fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia;

    if (!esValida) {
      throw new FechaInvalidaError(
        `La fecha ${dia}/${mes}/${anio} no es válida`,
      );
    }

    this.valor = fecha;
  }

  public static crear(
    dia: number,
    mes: number,
    anio: number,
  ): Result<Fecha, FechaInvalidaError> {
    try {
      const fecha = new Fecha(dia, mes, anio);
      const now = new Date();
      const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (fecha.valor > hoy) {
        return Result.fail(
          new FechaInvalidaError('La fecha no puede ser posterior al día de hoy'),
        );
      }
      return Result.ok(fecha);
    } catch (error) {
      if (error instanceof FechaInvalidaError) {
        return Result.fail(error);
      }
      throw error;
    }
  }

  public static fromDate(date: Date): Result<Fecha, FechaInvalidaError> {
    return Fecha.crear(date.getDate(), date.getMonth() + 1, date.getFullYear());
  }

  toString(): string {
    return `${this.dia.toString().padStart(2, '0')}/${this.mes.toString().padStart(2, '0')}/${this.anio}`;
  }

  toISOString(): string {
    return this.valor.toISOString();
  }

  equals(otra: Fecha): boolean {
    return (
      this.dia === otra.dia &&
      this.mes === otra.mes &&
      this.anio === otra.anio
    );
  }
}
