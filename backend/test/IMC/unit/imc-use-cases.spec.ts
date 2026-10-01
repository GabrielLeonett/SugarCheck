import { InMemoryImcRepository } from '../mocks/imc-repository.mock';
import { ImcFactory } from '../fixtures/imc.fixture';
import { GetAllImcByUserId } from '../../../src/IMC/app/GetAllImcByUserId';
import { GetOneImcById } from '../../../src/IMC/app/GetOneImcById';
import { UpdateImc } from '../../../src/IMC/app/UpdateImc';
import { DeleteImc } from '../../../src/IMC/app/DeleteImc';

describe('GetAllImcByUserId UseCase', () => {
  let repository: InMemoryImcRepository;
  let useCase: GetAllImcByUserId;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryImcRepository();
    useCase = new GetAllImcByUserId(repository);
  });

  test('retorna solo los registros del usuario solicitado', async () => {
    repository.items.push(
      ImcFactory.createInstance({ userId: USER_ID }),
      ImcFactory.createInstance({ userId: OTHER_USER }),
    );

    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()[0].userId.value).toBe(USER_ID);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ userId: '' });
    expect(result.isValid).toBe(false);
  });
});

describe('GetOneImcById UseCase', () => {
  let repository: InMemoryImcRepository;
  let useCase: GetOneImcById;

  beforeEach(() => {
    repository = new InMemoryImcRepository();
    useCase = new GetOneImcById(repository);
  });

  test('retorna el registro cuando existe', async () => {
    const imc = ImcFactory.createInstance();
    repository.items.push(imc);

    const result = await useCase.run({ id: imc.id.value });
    expect(result.isValid).toBe(true);
    expect(result.getValue().id.value).toBe(imc.id.value);
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run({ id: 'id-inexistente' });
    expect(result.isValid).toBe(false);
  });
});

describe('UpdateImc UseCase', () => {
  let repository: InMemoryImcRepository;
  let useCase: UpdateImc;

  beforeEach(() => {
    repository = new InMemoryImcRepository();
    useCase = new UpdateImc(repository);
  });

  test('actualiza el peso y recalcula el imcValue', async () => {
    const imc = ImcFactory.createInstance({ peso: 80, altura: 170 });
    repository.items.push(imc);

    const result = await useCase.run(imc.id.value, { peso: 75 });

    expect(result.isValid).toBe(true);
    expect(result.getValue().peso.value).toBe(75);
    expect(result.getValue().imcValue).toBeCloseTo(75 / (1.7 * 1.7), 5);
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run('id-inexistente', { peso: 75 });
    expect(result.isValid).toBe(false);
  });

  test('falla con un peso inválido', async () => {
    const imc = ImcFactory.createInstance();
    repository.items.push(imc);

    const result = await useCase.run(imc.id.value, { peso: 0 });
    expect(result.isValid).toBe(false);
  });
});

describe('DeleteImc UseCase', () => {
  let repository: InMemoryImcRepository;
  let useCase: DeleteImc;

  beforeEach(() => {
    repository = new InMemoryImcRepository();
    useCase = new DeleteImc(repository);
  });

  test('elimina el registro', async () => {
    const imc = ImcFactory.createInstance();
    repository.items.push(imc);

    const result = await useCase.run({ id: imc.id.value });

    expect(result.isValid).toBe(true);
    expect(repository.items).toHaveLength(0);
  });

  test('falla cuando el registro no existe', async () => {
    const result = await useCase.run({ id: 'id-inexistente' });
    expect(result.isValid).toBe(false);
  });
});
