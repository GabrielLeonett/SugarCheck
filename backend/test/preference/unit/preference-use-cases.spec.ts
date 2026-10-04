import { InMemoryPreferenceRepository } from '../mocks/preference-repository.mock';
import { PreferenceFactory } from '../fixtures/preference.fixture';
import { GetOneByIdPreference } from '../../../src/preference/app/GetOneByUserIdPreference';
import { SavePreference } from '../../../src/preference/app/SavePreference';

describe('GetOneByIdPreference UseCase', () => {
  let repository: InMemoryPreferenceRepository;
  let useCase: GetOneByIdPreference;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryPreferenceRepository();
    useCase = new GetOneByIdPreference(repository);
  });

  test('retorna las preferencias del usuario', async () => {
    const preference = PreferenceFactory.createInstance({ userId: USER_ID });
    repository.items.set(USER_ID, preference);

    const result = await useCase.run({ id: USER_ID });

    expect(result.isValid).toBe(true);
    expect(result.getValue().userId.value).toBe(USER_ID);
    expect(result.getValue().toPlain().thresholds).toEqual({
      hypo: 70,
      hiper: 180,
    });
  });

  test('falla cuando el usuario no tiene preferencias', async () => {
    const result = await useCase.run({
      id: '99999999-9999-4999-8999-999999999999',
    });
    expect(result.isValid).toBe(false);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ id: '' });
    expect(result.isValid).toBe(false);
  });
});

describe('SavePreference UseCase', () => {
  let repository: InMemoryPreferenceRepository;
  let useCase: SavePreference;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  const validArgs = {
    userId: USER_ID,
    profileImg: '/img/avatar.png',
    unitMeasure: 'mg/dL',
    thresholds: { hypo: 70, hiper: 180 },
    insulinRatios: { breakfast: 10, lunch: 12, dinner: 15 },
    sensitivity: 30,
  };

  beforeEach(() => {
    repository = new InMemoryPreferenceRepository();
    useCase = new SavePreference(repository);
  });

  test('guarda las preferencias por primera vez', async () => {
    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      validArgs.unitMeasure,
      validArgs.thresholds,
      validArgs.insulinRatios,
      validArgs.sensitivity,
    );

    expect(result.isValid).toBe(true);
    expect(repository.items.has(USER_ID)).toBe(true);
  });

  test('actualiza las preferencias existentes (upsert)', async () => {
    await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      validArgs.unitMeasure,
      validArgs.thresholds,
      validArgs.insulinRatios,
      validArgs.sensitivity,
    );

    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      'mmol/L',
      { hypo: 60, hiper: 200 },
      validArgs.insulinRatios,
      35,
    );

    expect(result.isValid).toBe(true);
    expect(repository.items.size).toBe(1);
    const saved = repository.items.get(USER_ID)!;
    expect(saved.unitMeasure.value).toBe('mmol/L');
    expect(saved.thresholds.value).toEqual({ hypo: 60, hiper: 200 });
    expect(saved.sensitivity.value).toBe(35);
  });

  test('rechaza una unidad de medida inválida', async () => {
    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      'mg/dl',
      validArgs.thresholds,
      validArgs.insulinRatios,
      validArgs.sensitivity,
    );
    expect(result.isValid).toBe(false);
  });

  test('rechaza umbrales incoherentes (hypo >= hiper)', async () => {
    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      validArgs.unitMeasure,
      { hypo: 200, hiper: 70 },
      validArgs.insulinRatios,
      validArgs.sensitivity,
    );
    expect(result.isValid).toBe(false);
  });

  test('rechaza un esquema basal con hora inválida', async () => {
    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      validArgs.unitMeasure,
      validArgs.thresholds,
      validArgs.insulinRatios,
      validArgs.sensitivity,
      undefined,
      [{ injectionTime: '8:30', dose: 5 }],
    );
    expect(result.isValid).toBe(false);
  });

  test('guarda esquemas de corrección y basales válidos', async () => {
    const result = await useCase.run(
      validArgs.userId,
      validArgs.profileImg,
      validArgs.unitMeasure,
      validArgs.thresholds,
      validArgs.insulinRatios,
      validArgs.sensitivity,
      [{ rangeMin: 0, rangeMax: 70, dose: 1 }],
      [{ injectionTime: '08:30', dose: 5 }],
    );

    expect(result.isValid).toBe(true);
    const plain = result.getValue().toPlain();
    expect(plain.correctionSchemas).toEqual([
      { rangeMin: 0, rangeMax: 70, dose: 1 },
    ]);
    expect(plain.basalSchemas).toEqual([{ injectionTime: '08:30', dose: 5 }]);
  });
});
