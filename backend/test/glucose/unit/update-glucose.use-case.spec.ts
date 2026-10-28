import { InMemoryGlucoseRepository } from '../mocks/glucose-repository.mock';
import { GlucoseFactory } from '../fixtures/glucose.fixture';
import { UpdateGlucose } from '../../../src/glucose/app/UpdateGlucose';

describe('UpdateGlucose UseCase', () => {
  let repository: InMemoryGlucoseRepository;
  let useCase: UpdateGlucose;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryGlucoseRepository();
    useCase = new UpdateGlucose(repository);
  });

  test('actualiza el valor de glucosa de un registro reciente', async () => {
    const glucose = GlucoseFactory.createInstance({
      userId: USER_ID,
      valueMgdl: 110,
    });
    repository.items.push(glucose);

    const result = await useCase.run(glucose.id.value, { valueMgdl: 160 });

    expect(result.isValid).toBe(true);
    expect(result.getValue().valueMgdl.value).toBe(160);
  });

  test('actualiza la etiqueta de comida', async () => {
    const glucose = GlucoseFactory.createInstance({ userId: USER_ID });
    repository.items.push(glucose);

    const result = await useCase.run(glucose.id.value, {
      mealTag: 'Control general',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().mealTag.value).toBe('Control general');
  });

  test('falla si el registro no existe', async () => {
    const result = await useCase.run('99999999-9999-4999-8999-999999999999', {
      valueMgdl: 120,
    });
    expect(result.isValid).toBe(false);
  });

  test('falla si la ventana de edición de 15 días expiró', async () => {
    const old = GlucoseFactory.createInstance({
      userId: USER_ID,
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    });
    repository.items.push(old);

    const result = await useCase.run(old.id.value, { valueMgdl: 120 });

    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('15 días');
  });

  test('falla con un valor inválido', async () => {
    const glucose = GlucoseFactory.createInstance({ userId: USER_ID });
    repository.items.push(glucose);

    const result = await useCase.run(glucose.id.value, { valueMgdl: -5 });
    expect(result.isValid).toBe(false);
  });

  test('falla con una etiqueta inválida', async () => {
    const glucose = GlucoseFactory.createInstance({ userId: USER_ID });
    repository.items.push(glucose);

    const result = await useCase.run(glucose.id.value, { mealTag: 'Inválida' });
    expect(result.isValid).toBe(false);
  });
});
