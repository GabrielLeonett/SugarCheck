import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { GetTotalsInsulina } from '../../../src/insulina/app/GetTotalsInsulina';

describe('GetTotalsInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: GetTotalsInsulina;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new GetTotalsInsulina(repository);
  });

  test('suma los totales rápidos y lentos en totalGeneral', async () => {
    repository.totalsResponse = { totalRapida: 10, totalLenta: 5 };

    const result = await useCase.run({ userId: USER_ID, date: new Date() });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toEqual({
      totalRapida: 10,
      totalLenta: 5,
      totalGeneral: 15,
    });
  });

  test('retorna ceros cuando no hay registros', async () => {
    const result = await useCase.run({ userId: USER_ID, date: new Date() });

    expect(result.isValid).toBe(true);
    expect(result.getValue().totalGeneral).toBe(0);
  });
});
