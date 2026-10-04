import { InMemoryGlucoseRepository } from '../mocks/glucose-repository.mock';
import { StubPreferenceLookup } from '../mocks/preference-lookup.mock';
import { StubCreateNotification } from '../mocks/notification-creator.mock';
import { GenerateUUID } from '../../shared/mocks/generate-uuid.mock';
import { CreateGlucose } from '../../../src/glucose/app/CreateGlucose';
import { DatabaseError } from '../../../src/shared/DatabaseError';
import { Result } from '../../../src/shared/result';

describe('CreateGlucose UseCase', () => {
  let repository: InMemoryGlucoseRepository;
  let preferenceLookup: StubPreferenceLookup;
  let createNotification: StubCreateNotification;
  let useCase: CreateGlucose;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryGlucoseRepository();
    preferenceLookup = new StubPreferenceLookup();
    createNotification = new StubCreateNotification();
    useCase = new CreateGlucose(
      repository,
      new GenerateUUID(),
      preferenceLookup,
      createNotification,
    );
  });

  test('crea un registro de glucosa válido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 110,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().valueMgdl.value).toBe(110);
    expect(result.getValue().userId.value).toBe(USER_ID);
    expect(repository.items).toHaveLength(1);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({
      userId: '',
      valueMgdl: 110,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });
    expect(result.isValid).toBe(false);
    expect(repository.items).toHaveLength(0);
  });

  test('rechaza un valor de glucosa inválido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 0,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });
    expect(result.isValid).toBe(false);
    expect(repository.items).toHaveLength(0);
  });

  test('rechaza una etiqueta de comida inválida', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 110,
      mealTag: 'Merienda',
      date: new Date(),
      time: '08:30',
    });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una hora con formato inválido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 110,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '25:99',
    });
    expect(result.isValid).toBe(false);
  });

  test('genera alerta de hipoglucemia cuando el valor está bajo el umbral', async () => {
    preferenceLookup.setPreferencePlain({
      unitMeasure: 'mg/dL',
      thresholds: { hypo: 70, hiper: 180 },
    });

    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 50,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().toPlain().alert).toBe('hipoglucemia');
    expect(createNotification.calls).toHaveLength(1);
    expect(createNotification.calls[0].titleKey).toBe('GLUCOSE_ALERT_HYPO');
    expect(createNotification.calls[0].type).toBe('warning');
  });

  test('genera alerta de hiperglucemia cuando el valor está sobre el umbral', async () => {
    preferenceLookup.setPreferencePlain({
      unitMeasure: 'mg/dL',
      thresholds: { hypo: 70, hiper: 180 },
    });

    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 300,
      mealTag: 'Despues de comer',
      date: new Date(),
      time: '14:00',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().toPlain().alert).toBe('hiperglucemia');
    expect(createNotification.calls).toHaveLength(1);
    expect(createNotification.calls[0].titleKey).toBe('GLUCOSE_ALERT_HYPER');
  });

  test('no genera alerta dentro de la zona segura', async () => {
    preferenceLookup.setPreferencePlain({
      unitMeasure: 'mg/dL',
      thresholds: { hypo: 70, hiper: 180 },
    });

    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 110,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });

    expect(result.getValue().toPlain().alert).toBeNull();
    expect(createNotification.calls).toHaveLength(0);
  });

  test('continúa sin alerta si la preferencia falla', async () => {
    preferenceLookup.setResponse(
      Result.fail(new DatabaseError('sin preferencia')),
    );

    const result = await useCase.run({
      userId: USER_ID,
      valueMgdl: 50,
      mealTag: 'En Ayunas',
      date: new Date(),
      time: '08:30',
    });

    expect(result.isValid).toBe(true);
    expect(createNotification.calls).toHaveLength(0);
  });
});
