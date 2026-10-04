import { InMemorySyncRepository } from '../mocks/sync-repository.mock';
import { PushChanges } from '../../../src/sync/app/PushChanges';

const USER_ID = '11111111-1111-4111-8111-111111111111';

const validGlucose = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  valueMgdl: 110,
  mealTag: 'En Ayunas',
  date: '2026-08-27T00:00:00.000Z',
  time: '08:30',
  createdAt: 1756272000000,
  updatedAt: 1756272000000,
  ...overrides,
});

const T0 = 1756272000000;

describe('PushChanges UseCase', () => {
  let repository: InMemorySyncRepository;
  let useCase: PushChanges;

  beforeEach(() => {
    repository = new InMemorySyncRepository();
    useCase = new PushChanges(repository);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ userId: '', changes: {} });
    expect(result.isValid).toBe(false);
  });

  test('rechaza changes con estructura inválida', async () => {
    const result = await useCase.run({ userId: USER_ID, changes: 'invalido' });
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('changes debe ser un objeto');
  });

  test('rechaza una tabla de changes con formato incorrecto', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: { glucose: { created: 'no-es-array' } },
    });
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('created debe ser un arreglo');
  });

  test('aplica un registro created nuevo y devuelve applied=1', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: { glucose: { created: [validGlucose('g-1')] } },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    expect(result.getValue().rejected).toHaveLength(0);
    expect(repository.appliedOps).toHaveLength(1);
    expect(repository.appliedOps[0].kind).toBe('upsert');
    expect(repository.appliedOps[0].key).toBe('g-1');
  });

  test('rechaza registros inválidos sin bloquear el resto del lote', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        glucose: {
          created: [
            validGlucose('g-bad', { valueMgdl: 'no-numero' }),
            validGlucose('g-good'),
          ],
        },
      },
    });

    expect(result.isValid).toBe(true);
    const value = result.getValue();
    expect(value.applied).toBe(1);
    expect(value.rejected).toHaveLength(1);
    expect(value.rejected[0].id).toBe('g-bad');
    expect(value.rejected[0].reason).toContain('valueMgdl');
  });

  test('LWW: ignora el cambio si el servidor tiene uno más reciente', async () => {
    repository.seed('glucose', 'g-1', {
      id: 'g-1',
      userId: USER_ID,
      valueMgdl: 90,
      mealTag: 'En Ayunas',
      date: new Date(T0),
      time: '08:00',
      createdAt: new Date(T0 - 1000),
      updatedAt: new Date(T0 + 2000),
      deletedAt: null,
    });

    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        glucose: { created: [validGlucose('g-1', { updatedAt: T0 })] },
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(0);
    expect(repository.appliedOps).toHaveLength(0);
  });

  test('es idempotente ante reintentos con el mismo updatedAt', async () => {
    repository.seed('glucose', 'g-1', {
      id: 'g-1',
      userId: USER_ID,
      valueMgdl: 90,
      mealTag: 'En Ayunas',
      date: new Date(T0),
      time: '08:00',
      createdAt: new Date(T0 - 1000),
      updatedAt: new Date(T0),
      deletedAt: null,
    });

    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        glucose: { created: [validGlucose('g-1', { updatedAt: T0 })] },
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(0);
    expect(repository.appliedOps).toHaveLength(0);
  });

  test('aplica el cambio cuando el cliente trae un updatedAt más reciente', async () => {
    repository.seed('glucose', 'g-1', {
      id: 'g-1',
      userId: USER_ID,
      valueMgdl: 90,
      mealTag: 'En Ayunas',
      date: new Date(T0),
      time: '08:00',
      createdAt: new Date(T0 - 1000),
      updatedAt: new Date(T0),
      deletedAt: null,
    });

    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        glucose: {
          created: [
            validGlucose('g-1', { valueMgdl: 150, updatedAt: T0 + 5000 }),
          ],
        },
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    const row: any = repository.getRow('glucose', 'g-1');
    expect(row.valueMgdl).toBe(150);
  });

  test('un updated sobre un registro inexistente lo crea (upsert)', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: { glucose: { updated: [validGlucose('g-nuevo')] } },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    const row: any = repository.getRow('glucose', 'g-nuevo');
    expect(row).toBeDefined();
    expect(row.userId).toBe(USER_ID);
  });

  test('created y updated del mismo registro en el lote respetan LWW intra-lote', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        glucose: {
          created: [
            validGlucose('g-1', { valueMgdl: 100, updatedAt: T0 + 1000 }),
          ],
          updated: [validGlucose('g-1', { valueMgdl: 200, updatedAt: T0 })],
        },
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    const row: any = repository.getRow('glucose', 'g-1');
    expect(row.valueMgdl).toBe(100);
  });

  test('aplica soft-delete a registros existentes y omite los inexistentes', async () => {
    repository.seed('glucose', 'g-1', {
      id: 'g-1',
      userId: USER_ID,
      valueMgdl: 90,
      mealTag: 'En Ayunas',
      date: new Date(T0),
      time: '08:00',
      createdAt: new Date(T0 - 1000),
      updatedAt: new Date(T0),
      deletedAt: null,
    });

    const result = await useCase.run({
      userId: USER_ID,
      changes: { glucose: { deleted: ['g-1', 'g-inexistente'] } },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    expect(repository.appliedOps[0].kind).toBe('softDelete');
    const row: any = repository.getRow('glucose', 'g-1');
    expect(row.deletedAt).not.toBeNull();
  });

  test('rechaza deleted sobre preference (no soportado)', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: { preference: { deleted: [USER_ID] } },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().rejected).toHaveLength(1);
    expect(result.getValue().rejected[0].reason).toContain('no está soportada');
  });

  test('valida un registro de insulina completo y lo aplica', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        insulina: {
          created: [
            {
              id: 'i-1',
              tipo: 'RAPIDA',
              dosis: 5,
              fecha: '2026-08-27T12:00:00.000Z',
              hora: '12:00',
              zona: 'BRAZO_DERECHO',
              contexto: 'DESAYUNO',
              createdAt: T0,
              updatedAt: T0,
            },
          ],
        },
      },
    });

    expect(result.isValid).toBe(true);
    const value = result.getValue();
    expect(value.applied).toBe(1);
    expect(value.rejected).toHaveLength(0);
  });

  test('calcula el imcValue al aplicar un registro de IMC', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      changes: {
        imc: {
          created: [
            {
              id: 'imc-1',
              peso: 80,
              altura: 170,
              fecha: '2026-08-27T00:00:00.000Z',
              createdAt: T0,
              updatedAt: T0,
            },
          ],
        },
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().applied).toBe(1);
    const row: any = repository.getRow('imc', 'imc-1');
    expect(row.imcValue).toBeCloseTo(80 / (1.7 * 1.7), 5);
  });
});
