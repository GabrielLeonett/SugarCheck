import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { InsulinaFactory } from '../fixtures/insulina.fixture';
import { GetOneInsulina } from '../../../src/insulina/app/GetOneInsulina';

describe('GetOneInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: GetOneInsulina;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new GetOneInsulina(repository);
  });

  test('retorna el registro cuando existe', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: USER_ID });
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value });

    expect(result.isValid).toBe(true);
    expect(result.getValue().id.value).toBe(insulina.id.value);
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run({
      id: '99999999-9999-4999-8999-999999999999',
    });
    expect(result.isValid).toBe(false);
  });

  test('falla con un id con formato inválido', async () => {
    const result = await useCase.run({ id: 'no-es-uuid' });
    expect(result.isValid).toBe(false);
  });
});
