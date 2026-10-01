import { InMemoryHbA1cRepository } from '../mocks/hba1c-repository.mock';
import { GenerateUUID } from '../../shared/mocks/generate-uuid.mock';
import { CreateHbA1c } from '../../../src/glucose/app/CreateHbA1c';

describe('CreateHbA1c UseCase', () => {
  let repository: InMemoryHbA1cRepository;
  let useCase: CreateHbA1c;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryHbA1cRepository();
    useCase = new CreateHbA1c(repository, new GenerateUUID());
  });

  test('crea un examen HbA1c válido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valuePercent: 6.5,
      examDate: new Date(),
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().valuePercent.value).toBe(6.5);
    expect(repository.items).toHaveLength(1);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({
      userId: '',
      valuePercent: 6.5,
      examDate: new Date(),
    });
    expect(result.isValid).toBe(false);
    expect(repository.items).toHaveLength(0);
  });

  test('rechaza un valor porcentual inválido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valuePercent: 0,
      examDate: new Date(),
    });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una fecha de examen inválida', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valuePercent: 6.5,
      examDate: 'no-es-fecha',
    });
    expect(result.isValid).toBe(false);
  });
});
