import { InMemoryGlucoseRepository } from '../mocks/glucose-repository.mock';
import { GlucoseFactory } from '../fixtures/glucose.fixture';
import { GetAllGlucose } from '../../../src/glucose/app/GetAllGlucose';

describe('GetAllGlucose UseCase', () => {
  let repository: InMemoryGlucoseRepository;
  let useCase: GetAllGlucose;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryGlucoseRepository();
    useCase = new GetAllGlucose(repository);
  });

  test('retorna lista vacía cuando no hay registros', async () => {
    const result = await useCase.run({ userId: USER_ID });
    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(0);
  });

  test('retorna solo los registros del usuario solicitado', async () => {
    const mine = GlucoseFactory.createManyInstances(2, { userId: USER_ID });
    const other = GlucoseFactory.createInstance({ userId: OTHER_USER });
    repository.items.push(...mine, other);

    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    const values = result.getValue();
    expect(values).toHaveLength(2);
    values.forEach((g) => expect(g.userId.value).toBe(USER_ID));
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ userId: '' });
    expect(result.isValid).toBe(false);
  });
});
