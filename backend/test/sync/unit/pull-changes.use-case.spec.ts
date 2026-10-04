import { InMemorySyncRepository } from '../mocks/sync-repository.mock';
import { PullChanges } from '../../../src/sync/app/PullChanges';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_USER = '22222222-2222-4222-8222-222222222222';

const T0 = 1756272000000; // base

const glucoseRow = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  userId: USER_ID,
  valueMgdl: 100,
  mealTag: 'En Ayunas',
  date: new Date(T0),
  time: '08:00',
  createdAt: new Date(T0 - 10000),
  updatedAt: new Date(T0 - 10000),
  deletedAt: null,
  ...overrides,
});

describe('PullChanges UseCase', () => {
  let repository: InMemorySyncRepository;
  let useCase: PullChanges;

  beforeEach(() => {
    repository = new InMemorySyncRepository();
    useCase = new PullChanges(repository);
  });

  test('primer sync (sin lastPulledAt) devuelve todos los vivos como created', async () => {
    repository.seed('glucose', 'g-1', glucoseRow('g-1'));
    repository.seed('glucose', 'g-2', glucoseRow('g-2'));
    repository.seed(
      'glucose',
      'g-del',
      glucoseRow('g-del', { deletedAt: new Date(T0) }),
    );

    const result = await useCase.run({ userId: USER_ID, lastPulledAt: null });

    expect(result.isValid).toBe(true);
    const { changes } = result.getValue();
    expect(changes.glucose.created).toHaveLength(2);
    expect(changes.glucose.updated).toHaveLength(0);
    expect(changes.glucose.deleted).toHaveLength(0);
  });

  test('clasifica created/updated/deleted correctamente desde lastPulledAt', async () => {
    repository.seed(
      'glucose',
      'g-new',
      glucoseRow('g-new', { createdAt: new Date(T0 + 10) }),
    );
    repository.seed(
      'glucose',
      'g-upd',
      glucoseRow('g-upd', {
        createdAt: new Date(T0 - 100),
        updatedAt: new Date(T0 + 5),
      }),
    );
    repository.seed(
      'glucose',
      'g-del',
      glucoseRow('g-del', {
        createdAt: new Date(T0 - 100),
        deletedAt: new Date(T0 + 7),
      }),
    );
    repository.seed('glucose', 'g-old', glucoseRow('g-old'));
    repository.seed(
      'glucose',
      'g-other',
      glucoseRow('g-other', { userId: OTHER_USER }),
    );

    const result = await useCase.run({ userId: USER_ID, lastPulledAt: T0 });

    expect(result.isValid).toBe(true);
    const { changes } = result.getValue();
    expect(changes.glucose.created.map((r: any) => r.id)).toEqual(['g-new']);
    expect(changes.glucose.updated.map((r: any) => r.id)).toEqual(['g-upd']);
    expect(changes.glucose.deleted).toEqual(['g-del']);
  });

  test('devuelve cambios de todas las tablas sincronizables', async () => {
    const result = await useCase.run({ userId: USER_ID, lastPulledAt: null });

    expect(result.isValid).toBe(true);
    const { changes } = result.getValue();
    for (const table of [
      'glucose',
      'hba1c',
      'insulina',
      'imc',
      'contactEmergence',
      'preference',
    ]) {
      expect(changes[table]).toBeDefined();
      expect(changes[table].created).toEqual([]);
    }
  });

  test('el timestamp devuelto es un epoch ms del servidor', async () => {
    const before = Date.now();
    const result = await useCase.run({ userId: USER_ID, lastPulledAt: null });

    expect(result.isValid).toBe(true);
    const { timestamp } = result.getValue();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });

  test('serializa timestamps de sync como epoch ms y fechas de negocio como ISO', async () => {
    repository.seed('glucose', 'g-1', glucoseRow('g-1'));

    const result = await useCase.run({ userId: USER_ID, lastPulledAt: null });

    expect(result.isValid).toBe(true);
    const row: any = result.getValue().changes.glucose.created[0];
    expect(typeof row.createdAt).toBe('number');
    expect(typeof row.updatedAt).toBe('number');
    expect(row.createdAt).toBe(T0 - 10000);
    expect(typeof row.date).toBe('string');
    expect(row.date).toBe(new Date(T0).toISOString());
    expect(row.valueMgdl).toBe(100);
  });

  test('preference se serializa con id = userId', async () => {
    repository.seed('preference', USER_ID, {
      userId: USER_ID,
      profileImg: 'img.png',
      unitMeasure: 'mg/dL',
      thresholds: { hypo: 70, hiper: 180 },
      insulinRatios: { breakfast: 10, lunch: 12, dinner: 14 },
      sensitivity: 30,
      correctionSchemas: null,
      basalSchemas: null,
      createdAt: new Date(T0),
      updatedAt: new Date(T0),
      deletedAt: null,
    });

    const result = await useCase.run({ userId: USER_ID, lastPulledAt: null });

    expect(result.isValid).toBe(true);
    const row: any = result.getValue().changes.preference.created[0];
    expect(row.id).toBe(USER_ID);
    expect(row.thresholds).toEqual({ hypo: 70, hiper: 180 });
  });
});
