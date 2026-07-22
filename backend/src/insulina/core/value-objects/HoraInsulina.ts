import { Result } from '../../../shared/result';
import { HoraInsulinaInvalidaError } from '../../../insulina/core/errors/HoraInsulinaInvalidaError';

export class HoraInsulina {
  private readonly _hours: number;
  private readonly _minutes: number;

  private constructor(hours: number, minutes: number) {
    this._hours = hours;
    this._minutes = minutes;
  }

  get hours(): number {
    return this._hours;
  }

  get minutes(): number {
    return this._minutes;
  }

  public static create(value: string): Result<HoraInsulina, HoraInsulinaInvalidaError> {
    if (!value || typeof value !== 'string') {
      return Result.fail(new HoraInsulinaInvalidaError('La hora es requerida'));
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(value)) {
      return Result.fail(new HoraInsulinaInvalidaError('Formato de hora inválido (HH:MM)'));
    }
    const [hours, minutes] = value.split(':').map(Number);
    return Result.ok(new HoraInsulina(hours, minutes));
  }

  public static createFromNumbers(hours: number, minutes: number): Result<HoraInsulina, HoraInsulinaInvalidaError> {
    if (hours < 0 || hours > 23) {
      return Result.fail(new HoraInsulinaInvalidaError('Hora inválida (0-23)'));
    }
    if (minutes < 0 || minutes > 59) {
      return Result.fail(new HoraInsulinaInvalidaError('Minutos inválidos (0-59)'));
    }
    return Result.ok(new HoraInsulina(hours, minutes));
  }

  public toString(): string {
    return `${String(this._hours).padStart(2, '0')}:${String(this._minutes).padStart(2, '0')}`;
  }

  public toMinutes(): number {
    return this._hours * 60 + this._minutes;
  }

  public equals(other: HoraInsulina): boolean {
    return this._hours === other._hours && this._minutes === other._minutes;
  }

  public isBefore(other: HoraInsulina): boolean {
    return this.toMinutes() < other.toMinutes();
  }

  public isAfter(other: HoraInsulina): boolean {
    return this.toMinutes() > other.toMinutes();
  }

  public diffInMinutes(other: HoraInsulina): number {
    return Math.abs(this.toMinutes() - other.toMinutes());
  }
}