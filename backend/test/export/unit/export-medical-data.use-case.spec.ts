import { ExportMedicalData } from '../../../src/export/app/ExportMedicalData';
import {
  MedicalExportData,
  MedicalExportPeriod,
} from '../../../src/export/core/MedicalExportData';
import { MedicalExportRepository } from '../../../src/export/core/MedicalExportRepository';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Result } from '../../../src/shared/result';

class InMemoryMedicalExportRepository implements MedicalExportRepository {
  public readonly calls: { userId: string; period: MedicalExportPeriod }[] = [];

  async getMedicalData(
    userId: string,
    period: MedicalExportPeriod,
  ): Promise<Result<MedicalExportData, ErrorAbstract>> {
    this.calls.push({ userId, period });

    return Result.ok<MedicalExportData, ErrorAbstract>({
      patient: { name: 'Paciente Test', username: 'paciente' },
      period,
      generatedAt: new Date('2026-10-27T12:00:00.000Z'),
      glucose: [],
      hba1c: [],
      insulin: [],
      imc: [],
    });
  }
}

describe('ExportMedicalData UseCase', () => {
  let repository: InMemoryMedicalExportRepository;
  let useCase: ExportMedicalData;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryMedicalExportRepository();
    useCase = new ExportMedicalData(repository);
  });

  test('rechaza un userId inválido y no consulta el repositorio', async () => {
    const result = await useCase.run({ userId: '   ' });

    expect(result.isValid).toBe(false);
    expect(repository.calls).toHaveLength(0);
  });

  test('exporta todo el historial cuando no se envían fechas', async () => {
    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    expect(repository.calls).toHaveLength(1);
    expect(repository.calls[0].period).toEqual({ from: null, to: null });
  });

  test('rechaza una fecha inicial con formato inválido', async () => {
    const result = await useCase.run({ userId: USER_ID, from: '27-10-2026' });

    expect(result.isValid).toBe(false);
    expect(result.getError().code).toBe('EXPORT_INVALID_DATE_RANGE');
    expect(result.getError().field).toBe('from');
    expect(repository.calls).toHaveLength(0);
  });

  test('rechaza una fecha final con formato inválido', async () => {
    const result = await useCase.run({ userId: USER_ID, to: '2026-13-01' });

    expect(result.isValid).toBe(false);
    expect(result.getError().code).toBe('EXPORT_INVALID_DATE_RANGE');
    expect(result.getError().field).toBe('to');
    expect(repository.calls).toHaveLength(0);
  });

  test('rechaza un rango con la fecha inicial posterior a la final', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      from: '2026-10-27',
      to: '2026-10-01',
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().code).toBe('EXPORT_INVALID_DATE_RANGE');
    expect(repository.calls).toHaveLength(0);
  });

  test('calcula el inicio y el fin del día para un rango válido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      from: '2026-10-01',
      to: '2026-10-27',
    });

    expect(result.isValid).toBe(true);
    const { period } = repository.calls[0];

    expect(period.from?.getFullYear()).toBe(2026);
    expect(period.from?.getMonth()).toBe(9);
    expect(period.from?.getDate()).toBe(1);
    expect(period.from?.getHours()).toBe(0);
    expect(period.from?.getMinutes()).toBe(0);

    expect(period.to?.getFullYear()).toBe(2026);
    expect(period.to?.getMonth()).toBe(9);
    expect(period.to?.getDate()).toBe(27);
    expect(period.to?.getHours()).toBe(23);
    expect(period.to?.getMinutes()).toBe(59);
    expect(period.to?.getSeconds()).toBe(59);
    expect(period.to?.getMilliseconds()).toBe(999);
  });

  test('permite enviar solo la fecha inicial', async () => {
    const result = await useCase.run({ userId: USER_ID, from: '2026-10-01' });

    expect(result.isValid).toBe(true);
    expect(repository.calls[0].period.from).not.toBeNull();
    expect(repository.calls[0].period.to).toBeNull();
  });

  test('permite enviar solo la fecha final', async () => {
    const result = await useCase.run({ userId: USER_ID, to: '2026-10-27' });

    expect(result.isValid).toBe(true);
    expect(repository.calls[0].period.from).toBeNull();
    expect(repository.calls[0].period.to).not.toBeNull();
  });
});
