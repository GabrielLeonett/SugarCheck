import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { DeleteInsulina } from '../../../src/insulina/app/DeleteInsulina';

describe('DeleteInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: DeleteInsulina;

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new DeleteInsulina(repository);
  });

  test('siempre falla: el negocio prohíbe eliminar registros de insulina', async () => {
    const result = await useCase.run({
      id: '99999999-9999-4999-8999-999999999999',
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().message).toBeTruthy();
    expect(repository.items).toHaveLength(0);
  });
});
