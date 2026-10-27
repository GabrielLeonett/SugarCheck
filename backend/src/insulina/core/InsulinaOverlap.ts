import { Insulina } from './Insulina';
import { FechaInsulina } from './value-objects/FechaInsulina';
import { HoraInsulina } from './value-objects/HoraInsulina';
import { TipoInsulina } from './value-objects/TipoInsulina';

/**
 * Margen mínimo entre dos dosis de insulina rápida.
 * Coincide con el "cronómetro de seguridad" de 3 horas de la app móvil.
 */
export const RAPID_INSULIN_SAFETY_WINDOW_MINUTES = 180;

export function combineFechaHora(
  fecha: FechaInsulina,
  hora: HoraInsulina,
): Date {
  const date = fecha.value;
  date.setHours(hora.hours, hora.minutes, 0, 0);
  return date;
}

/**
 * Devuelve el primer registro que se solapa con la dosis candidata:
 * - Cualquier tipo: misma fecha y hora exactas (registro duplicado).
 * - Insulina rápida: otra dosis rápida dentro del margen de seguridad.
 */
export function findOverlappingInsulin(
  records: Insulina[],
  candidate: {
    fecha: FechaInsulina;
    hora: HoraInsulina;
    tipo: TipoInsulina;
  },
  excludeId?: string,
): Insulina | null {
  const candidateTime = combineFechaHora(
    candidate.fecha,
    candidate.hora,
  ).getTime();
  const windowMs = RAPID_INSULIN_SAFETY_WINDOW_MINUTES * 60 * 1000;

  for (const record of records) {
    if (excludeId && record.id.value === excludeId) continue;

    const recordTime = combineFechaHora(record.fecha, record.hora).getTime();

    if (recordTime === candidateTime) return record;

    if (
      candidate.tipo.isRapida() &&
      record.tipo.isRapida() &&
      Math.abs(recordTime - candidateTime) < windowMs
    ) {
      return record;
    }
  }

  return null;
}
