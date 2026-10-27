export const MEDICAL_RECORD_EDIT_WINDOW_DAYS = 15;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Regla de negocio compartida por los registros médicos (glucosa, HbA1c,
 * IMC e insulina): solo se pueden modificar o eliminar durante los primeros
 * 15 días desde que se creó el registro.
 */
export function isWithinMedicalRecordEditWindow(
  createdAt: Date,
  now: Date = new Date(),
): boolean {
  const elapsedMs = now.getTime() - createdAt.getTime();
  return elapsedMs <= MEDICAL_RECORD_EDIT_WINDOW_DAYS * MS_PER_DAY;
}

export function daysSinceMedicalRecordCreation(
  createdAt: Date,
  now: Date = new Date(),
): number {
  return Math.floor(
    (now.getTime() - createdAt.getTime()) / MS_PER_DAY,
  );
}
