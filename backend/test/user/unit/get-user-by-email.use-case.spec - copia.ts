import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { UserFactory } from '../fixtures/user.fixture'; // Usando la Factory que vimos
import { GetOneByEmailUser } from '../../../src/user/app/GetOneByEmailUser';
import { UserRepository } from '../../../src/user/core/UserRepository';

describe('GetOneByEmailUser UseCase', () => {
  let repository: UserRepository;
  let useCase: GetOneByEmailUser;

  beforeEach(() => {
    // Limpiamos el estado antes de cada test
    repository = new InMemoryUserRepository();
    useCase = new GetOneByEmailUser(repository);
  });

  test('debería traer el usuario por su correo', async () => {
    const user = UserFactory.createInstance();
    await repository.save(user);

    const result = await useCase.run({ email: user.email.value });

    expect(result.isValid).toBe(true);
    const users = result.getValue();
    expect(users.id.value).toBe(user.id.value);
  });
});
