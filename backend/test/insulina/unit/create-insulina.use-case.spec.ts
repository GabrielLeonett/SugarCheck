import { InMemoryInsulinaRepository } from '../mocks/insulina-repository.mock';
import { GenerateUUID } from '../../shared/mocks/generate-uuid.mock';
import { CreateInsulina } from '../../../src/insulina/app/CreateInsulina';

describe('CreateInsulina UseCase', () => {
  let repository: InMemoryInsulinaRepository;
  let useCase: CreateInsulina;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const validParams = {
    userId: USER_ID,
    tipo: 'RAPIDA',
    dosis: 5,
    dia: 1,
    mes: 1,
    anio: 2026,
    hora: '08:30',
    zona: 'ABDOMEN_DERECHO',
    contexto: 'DESAYUNO',
  };

  beforeEach(() => {
    repository = new InMemoryInsulinaRepository();
    useCase = new CreateInsulina(repository, new GenerateUUID());
  });

  test('crea una insulina rápida con contexto', async () => {
    const result = await useCase.run(validParams);

    expect(result.isValid).toBe(true);
    expect(result.getValue().tipo.toString()).toBe('RAPIDA');
    expect(result.getValue().contexto?.toString()).toBe('DESAYUNO');
    expect(repository.items).toHaveLength(1);
  });

  test('crea una insulina lenta e ignora el contexto', async () => {
    const result = await useCase.run({ ...validParams, tipo: 'LENTA' });

    expect(result.isValid).toBe(true);
    expect(result.getValue().tipo.toString()).toBe('LENTA');
    expect(result.getValue().contexto).toBeNull();
  });

  test('rechaza insulina rápida sin contexto', async () => {
    const { contexto, ...sinContexto } = validParams;
    void contexto;
    const result = await useCase.run(sinContexto);
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('contexto');
  });

  test('rechaza un tipo de insulina inválido', async () => {
    const result = await useCase.run({ ...validParams, tipo: 'INTERMEDIA' });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una dosis inválida (0)', async () => {
    const result = await useCase.run({ ...validParams, dosis: 0 });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una dosis con incrementos no múltiplos de 0.5', async () => {
    const result = await useCase.run({ ...validParams, dosis: 3.25 });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una zona de inyección inválida', async () => {
    const result = await useCase.run({ ...validParams, zona: 'CABEZA' });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una fecha futura', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const result = await useCase.run({
      ...validParams,
      dia: future.getDate(),
      mes: future.getMonth() + 1,
      anio: future.getFullYear(),
    });
    expect(result.isValid).toBe(false);
  });

  test('rechaza una fecha imposible (31/2)', async () => {
    const result = await useCase.run({ ...validParams, dia: 31, mes: 2 });
    expect(result.isValid).toBe(false);
  });

  describe('solapamiento de dosis', () => {
    test('rechaza un registro duplicado en la misma fecha y hora', async () => {
      await useCase.run(validParams);

      const result = await useCase.run(validParams);

      expect(result.isValid).toBe(false);
      expect(result.getError().code).toBe('INSULIN_OVERLAP');
    });

    test('rechaza dos dosis rápidas dentro del margen de 3 horas', async () => {
      await useCase.run({ ...validParams, hora: '08:30' });

      const result = await useCase.run({ ...validParams, hora: '10:30' });

      expect(result.isValid).toBe(false);
      expect(result.getError().code).toBe('INSULIN_OVERLAP');
    });

    test('permite dos dosis rápidas separadas exactamente 3 horas', async () => {
      await useCase.run({ ...validParams, hora: '08:30' });

      const result = await useCase.run({ ...validParams, hora: '11:30' });

      expect(result.isValid).toBe(true);
    });

    test('permite una dosis lenta dentro de las 3 horas de una rápida', async () => {
      await useCase.run({ ...validParams, tipo: 'RAPIDA', hora: '08:30' });

      const result = await useCase.run({
        ...validParams,
        tipo: 'LENTA',
        contexto: undefined,
        hora: '10:30',
      });

      expect(result.isValid).toBe(true);
    });

    test('rechaza dos dosis lentas en la misma fecha y hora', async () => {
      const lenta = {
        ...validParams,
        tipo: 'LENTA',
        contexto: undefined,
        hora: '22:00',
      };
      await useCase.run(lenta);

      const result = await useCase.run(lenta);

      expect(result.isValid).toBe(false);
      expect(result.getError().code).toBe('INSULIN_OVERLAP');
    });
  });
});
