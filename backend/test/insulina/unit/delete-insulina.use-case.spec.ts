import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { InsulinaFactory } from '../fixtures/insulina.fixture';
import { DeleteInsulina } from '../../../src/insulina/app/DeleteInsulina';

describe('DeleteInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: DeleteInsulina;

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new DeleteInsulina(repository);
  });

  test('elimina un registro creado dentro de los últimos 15 días', async () => {
    const insulina = InsulinaFactory.createInstance();
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value });

    expect(result.isValid).toBe(true);
    expect(repository.items).toHaveLength(0);
  });

  test('bloquea la eliminación después de 15 días', async () => {
    const insulina = InsulinaFactory.createInstance({
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    });
    repository.items.push(insulina);

    const result = await useCase.run({ id: insulina.id.value });

    expect(result.isValid).toBe(false);
    expect(result.getError().name).toBe('MedicalRecordNotEditableError');
    expect(repository.items).toHaveLength(1);
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run({
      id: '99999999-9999-4999-8999-999999999999',
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().name).toBe('InsulinaNotFoundError');
  });
});
