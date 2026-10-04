import { InMemoryHbA1cRepository } from '../mocks/hba1c-repository.mock';
import { HbA1cFactory } from '../fixtures/hba1c.fixture';
import { UpdateHbA1c } from '../../../src/glucose/app/UpdateHbA1c';

describe('UpdateHbA1c UseCase', () => {
  let repository: InMemoryHbA1cRepository;
  let useCase: UpdateHbA1c;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryHbA1cRepository();
    useCase = new UpdateHbA1c(repository);
  });

  test('actualiza el porcentaje de un examen reciente', async () => {
    const hba1c = HbA1cFactory.createInstance({
      userId: USER_ID,
      valuePercent: 6.5,
    });
    repository.items.push(hba1c);

    const result = await useCase.run(hba1c.id.value, { valuePercent: 7.2 });

    expect(result.isValid).toBe(true);
    expect(result.getValue().valuePercent.value).toBe(7.2);
  });

  test('falla si el examen no existe', async () => {
    const result = await useCase.run('99999999-9999-4999-8999-999999999999', {
      valuePercent: 7,
    });
    expect(result.isValid).toBe(false);
  });

  test('falla con un valor inválido', async () => {
    const hba1c = HbA1cFactory.createInstance({ userId: USER_ID });
    repository.items.push(hba1c);

    const result = await useCase.run(hba1c.id.value, { valuePercent: 0 });
    expect(result.isValid).toBe(false);
  });
});
