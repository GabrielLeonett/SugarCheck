import { InMemoryHbA1cRepository } from '../mocks/hba1c-repository.mock';
import { HbA1cFactory } from '../fixtures/hba1c.fixture';
import { GetAllHbA1c } from '../../../src/glucose/app/GetAllHbA1c';

describe('GetAllHbA1c UseCase', () => {
  let repository: InMemoryHbA1cRepository;
  let useCase: GetAllHbA1c;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryHbA1cRepository();
    useCase = new GetAllHbA1c(repository);
  });

  test('retorna solo los exámenes del usuario solicitado', async () => {
    repository.items.push(
      HbA1cFactory.createInstance({ userId: USER_ID }),
      HbA1cFactory.createInstance({ userId: USER_ID }),
      HbA1cFactory.createInstance({ userId: OTHER_USER }),
    );

    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(2);
  });

  test('retorna lista vacía si no hay registros', async () => {
    const result = await useCase.run({ userId: USER_ID });
    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(0);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ userId: '' });
    expect(result.isValid).toBe(false);
  });
});
