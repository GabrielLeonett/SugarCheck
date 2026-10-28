import {
  MEDICAL_RECORD_EDIT_WINDOW_DAYS,
  daysSinceMedicalRecordCreation,
  isWithinMedicalRecordEditWindow,
} from '../../../src/shared/core/MedicalRecordEditWindow';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('MedicalRecordEditWindow', () => {
  const now = new Date('2026-01-31T12:00:00.000Z');

  test('la ventana es de 15 días', () => {
    expect(MEDICAL_RECORD_EDIT_WINDOW_DAYS).toBe(15);
  });

  test('permite editar justo en el día 15', () => {
    const createdAt = new Date(now.getTime() - 15 * MS_PER_DAY);
    expect(isWithinMedicalRecordEditWindow(createdAt, now)).toBe(true);
  });

  test('permite editar un registro recién creado', () => {
    expect(isWithinMedicalRecordEditWindow(now, now)).toBe(true);
  });

  test('bloquea al superar los 15 días', () => {
    const createdAt = new Date(now.getTime() - 15 * MS_PER_DAY - 1);
    expect(isWithinMedicalRecordEditWindow(createdAt, now)).toBe(false);
  });

  test('bloquea un registro de 16 días', () => {
    const createdAt = new Date(now.getTime() - 16 * MS_PER_DAY);
    expect(isWithinMedicalRecordEditWindow(createdAt, now)).toBe(false);
  });

  test('calcula los días transcurridos desde la creación', () => {
    const createdAt = new Date(now.getTime() - 16 * MS_PER_DAY);
    expect(daysSinceMedicalRecordCreation(createdAt, now)).toBe(16);
  });
});
