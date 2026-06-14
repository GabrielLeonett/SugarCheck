// 1. ELIMINAMOS el import de 'node:test' para que Jest tome el control total
import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { UserFactory } from '../fixtures/user.fixture';
import { SaveUser } from '../../../src/user/app/SaveUser';
import { BcryptHasher } from '../mocks/hasher.mock';
import { GenerateUUID } from '../mocks/generate-uuid.mock';

describe('SaveUser UseCase', () => {
  let repository: InMemoryUserRepository;
  let hasher: BcryptHasher;
  let generate: GenerateUUID;
  let useCase: SaveUser;

  beforeEach(() => {
    // Inicialización limpia para cada test
    repository = new InMemoryUserRepository();
    hasher = new BcryptHasher();
    generate = new GenerateUUID();
    useCase = new SaveUser(repository, hasher, generate);
  });

  test('debería registrar un nuevo usuario exitosamente', async () => {
    const rawUserData = UserFactory.createInstance();

    // 2. Exercise: Ejecutamos el caso de uso de Guardar
    const result = await useCase.run(rawUserData.toPlain());

    // 3. Verify:
    expect(result.isValid).toBe(true);

    const savedUser = result.getValue();

    // Verificamos que el usuario devuelto tenga los datos correctos
    expect(savedUser.email.value).toBe(rawUserData.email.value);

    // Verificamos que realmente se guardó en el repositorio
    const repoCheck = await repository.getOneByEmail(savedUser.email);
    expect(repoCheck.isValid).toBe(true);
  });

  // test('debería fallar si el usuario ya existe', async () => {
  //   // 1. Setup
  //   const existingUser = UserFactory.createInstance({
  //     email: 'test@duplicado.com',
  //   });
  //   await repository.save(existingUser);

  //   // 2. Act
  //   const result = await useCase.run(existingUser.toPlain());

  //   // 3. Verify
  //   expect(result.isValid).toBe(false);
  //   // Asumiendo que usas un Result Pattern con códigos de error:
  //   expect(result.getError().message).toContain('already exists');
  // });
});
