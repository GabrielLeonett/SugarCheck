import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { InsulinaFactory } from '../fixtures/insulina.fixture';
import { GetAllInsulinas } from '../../../src/insulina/app/GetAllInsulinas';

describe('GetAllInsulinas UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: GetAllInsulinas;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new GetAllInsulinas(repository);
  });

  test('retorna los registros del usuario', async () => {
    repository.items.push(
      InsulinaFactory.createInstance({ userId: USER_ID }),
      InsulinaFactory.createInstance({ userId: USER_ID, tipo: 'LENTA' }),
      InsulinaFactory.createInstance({ userId: OTHER_USER }),
    );

    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(2);
  });

  test('filtra por tipo sin distinguir mayúsculas', async () => {
    repository.items.push(
      InsulinaFactory.createInstance({ userId: USER_ID }),
      InsulinaFactory.createInstance({ userId: USER_ID, tipo: 'LENTA' }),
    );

    const result = await useCase.run({ userId: USER_ID, tipo: 'rapida' });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()[0].tipo.toString()).toBe('RAPIDA');
  });

  test('usa el rango de fechas cuando ambas están presentes', async () => {
    const inRange = InsulinaFactory.createInstance({
      userId: USER_ID,
      fecha: new Date(2026, 0, 15),
    });
    const outOfRange = InsulinaFactory.createInstance({
      userId: USER_ID,
      fecha: new Date(2025, 0, 15),
    });
    repository.items.push(inRange, outOfRange);

    const result = await useCase.run({
      userId: USER_ID,
      startDate: new Date(2026, 0, 1).toISOString(),
      endDate: new Date(2026, 0, 31).toISOString(),
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()[0].id.value).toBe(inRange.id.value);
  });
});
