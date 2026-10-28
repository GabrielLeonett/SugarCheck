import { InMemoryImcRepository } from '../mocks/imc-repository.mock';
import { StubCreateNotification } from '../mocks/notification-creator.mock';
import { GenerateUUID } from '../../shared/mocks/generate-uuid.mock';
import { ImcFactory } from '../fixtures/imc.fixture';
import { CreateImc } from '../../../src/IMC/app/CreateImc';

describe('CreateImc UseCase', () => {
  let repository: InMemoryImcRepository;
  let createNotification: StubCreateNotification;
  let useCase: CreateImc;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  const validParams = {
    userId: USER_ID,
    peso: 80,
    altura: 170,
    dia: 1,
    mes: 1,
    anio: 2026,
  };

  beforeEach(() => {
    repository = new InMemoryImcRepository();
    createNotification = new StubCreateNotification();
    useCase = new CreateImc(
      repository,
      new GenerateUUID(),
      createNotification as any,
    );
  });

  test('crea un registro IMC con imcValue calculado', async () => {
    const result = await useCase.run(validParams);

    expect(result.isValid).toBe(true);
    expect(result.getValue().peso.value).toBe(80);
    expect(result.getValue().imcValue).toBeCloseTo(80 / (1.7 * 1.7), 5);
    expect(repository.items).toHaveLength(1);
  });

  test('rechaza una fecha futura', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const result = await useCase.run({
      ...validParams,
      dia: future.getDate(),
      mes: future.getMonth() + 1,
      anio: future.getFullYear() + 1,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('posterior');
  });

  test('rechaza un cambio de peso drástico (>5kg) respecto al último registro', async () => {
    repository.items.push(
      ImcFactory.createInstance({
        userId: USER_ID,
        peso: 80,
      }),
    );

    const result = await useCase.run({ ...validParams, peso: 90 });
    expect(result.isValid).toBe(false);
    expect(result.getError().message.toLowerCase()).toContain('peso');
  });

  test('intenta crear la notificación de registro de IMC', async () => {
    await useCase.run(validParams);
    expect(createNotification.calls).toHaveLength(1);
    expect(createNotification.calls[0].titleKey).toBe('IMC_CREATION_TITLE');
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ ...validParams, userId: '' });
    expect(result.isValid).toBe(false);
  });

  test('rechaza un peso fuera de rango', async () => {
    const result = await useCase.run({ ...validParams, peso: 800 });
    expect(result.isValid).toBe(false);
  });
});
