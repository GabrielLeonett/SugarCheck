import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { UserFactory } from '../fixtures/user.fixture';
import { DeleteUser } from '../../../src/user/app/DeleteUser';

describe('DeleteUser UseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: DeleteUser;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new DeleteUser(repository);
  });

  test('debería eliminar un usuario existente con éxito', async () => {
    // 1. Setup: Creamos un usuario y lo guardamos en el repo
    const existingUser = UserFactory.createInstance();
    await repository.save(existingUser);

    // 2. Exercise: Ejecutamos el caso de uso de Eliminar pasándole el ID
    const result = await useCase.run({ id: existingUser.id.value });

    // 3. Verify:
    expect(result.isValid).toBe(true);

    // Verificamos que ya NO exista en el repositorio
    const repoCheck = await repository.getOneById(existingUser.id);
    expect(repoCheck.isValid).toBe(false); // Debería dar error de "no encontrado"
  });

  test('debería retornar un error si el usuario a eliminar no existe', async () => {
    // 1. Setup: No guardamos nada en el repositorio (está vacío)
    const randomId = UserFactory.createRaw();

    // 2. Exercise
    const result = await useCase.run({ id: randomId.id.value });

    // 3. Verify: Debería fallar porque no hay nadie que borrar
    expect(result.isValid).toBe(false);
    // Opcional: verificar el mensaje de error
    // expect(result.error.message).toContain('not found');
  });
});
