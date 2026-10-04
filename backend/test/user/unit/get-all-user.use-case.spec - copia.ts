import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { GetAllUser } from '../../../src/user/app/GetAllUser';
import { UserFactory } from '../fixtures/user.fixture'; // Usando la Factory que vimos
import { UserRepository } from '../../../src/user/core/UserRepository';

describe('GetAllUser UseCase', () => {
  let repository: UserRepository;
  let useCase: GetAllUser;

  beforeEach(() => {
    // Limpiamos el estado antes de cada test
    repository = new InMemoryUserRepository();
    useCase = new GetAllUser(repository);
  });

  test('debería retornar una lista vacía de usuarios si no hay registros', async () => {
    // 1. Ejecutamos el caso de uso
    const result = await useCase.run();

    // 2. IMPORTANTE: Como usas Result Pattern, primero verificas el éxito
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toBe('No hay usuarios');
  });

  test('debería traer todos los usuarios cuando existen registros', async () => {
    // 1. Setup: Agregamos fixtures al repositorio in-memory
    const user1 = UserFactory.createInstance();
    const user2 = UserFactory.createInstance();
    await repository.save(user1);
    await repository.save(user2);

    // 2. Exercise
    const result = await useCase.run();

    // 3. Verify: Extraemos el valor del Result para hacer el expect
    expect(result.isValid).toBe(true);
    const users = result.getValue(); // Método para obtener el T del Result.ok(T)
    expect(users).toHaveLength(2);
    expect(users[0].id.value).toBe(user1.id.value);
  });
});
