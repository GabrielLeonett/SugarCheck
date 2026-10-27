import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { InsulinaFactory } from '../fixtures/insulina.fixture';
import { UpdateInsulina } from '../../../src/insulina/app/UpdateInsulina';

describe('UpdateInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: UpdateInsulina;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new UpdateInsulina(repository);
  });

  test('actualiza la dosis de un registro reciente', async () => {
    const insulina = InsulinaFactory.createInstance({
      userId: USER_ID,
      dosis: 5,
    });
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value, dosis: 7.5 });

    expect(result.isValid).toBe(true);
    expect(result.getValue().dosis.value).toBe(7.5);
  });

  test('actualiza el contexto de un registro rápido', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: USER_ID });
    repository.items.push(insulina);

    const result = await useCase.run({
      id: insulina.id.value,
      contexto: 'CENA',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().contexto?.toString()).toBe('CENA');
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run({
      id: '99999999-9999-4999-8999-999999999999',
      dosis: 5,
    });
    expect(result.isValid).toBe(false);
  });

  test('falla si pasaron más de 15 días desde la creación', async () => {
    const old = InsulinaFactory.createInstance({
      userId: USER_ID,
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    });
    repository.items.push(old);

    const result = await useCase.run({ id: old.id.value, dosis: 5 });
    expect(result.isValid).toBe(false);
  });

  test('falla si se intenta quitar el contexto a una insulina rápida', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: USER_ID });
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value, contexto: null });
    expect(result.isValid).toBe(false);
  });

  test('falla con una dosis inválida', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: USER_ID });
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value, dosis: 100.5 });
    expect(result.isValid).toBe(false);
  });

  describe('solapamiento de dosis', () => {
    test('rechaza mover un registro al mismo horario que otro', async () => {
      const primera = InsulinaFactory.createInstance({
        userId: USER_ID,
        hora: '08:30',
      });
      const segunda = InsulinaFactory.createInstance({
        userId: USER_ID,
        hora: '14:30',
      });
      repository.items.push(primera, segunda);

      const result = await useCase.run({
        id: segunda.id.value,
        hora: '08:30',
      });

      expect(result.isValid).toBe(false);
      expect(result.getError().code).toBe('INSULIN_OVERLAP');
    });

    test('rechaza mover una rápida dentro del margen de 3 horas', async () => {
      const primera = InsulinaFactory.createInstance({
        userId: USER_ID,
        hora: '08:30',
      });
      const segunda = InsulinaFactory.createInstance({
        userId: USER_ID,
        hora: '14:30',
      });
      repository.items.push(primera, segunda);

      const result = await useCase.run({
        id: segunda.id.value,
        hora: '10:00',
      });

      expect(result.isValid).toBe(false);
      expect(result.getError().code).toBe('INSULIN_OVERLAP');
    });

    test('permite editar un registro sin cambiar su horario', async () => {
      const insulina = InsulinaFactory.createInstance({
        userId: USER_ID,
        hora: '08:30',
      });
      repository.items.push(insulina);

      const result = await useCase.run({
        id: insulina.id.value,
        dosis: 6,
      });

      expect(result.isValid).toBe(true);
      expect(result.getValue().dosis.value).toBe(6);
    });
  });
});
