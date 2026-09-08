import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { UserFactory } from '../fixtures/user.fixture'; // Usando la Factory que vimos

import { GetOneByIdUser } from '../../../src/user/app/GetOneByIdUser';
import { UserRepository } from '../../../src/user/core/UserRepository';

describe('GetOneByIdUser UseCase', () => {
  let repository: UserRepository;
  let useCase: GetOneByIdUser;

  beforeEach(() => {
    // Limpiamos el estado antes de cada test
    repository = new InMemoryUserRepository();
    useCase = new GetOneByIdUser(repository);
  });

  test('debería traer el usuario por su correo', async () => {
    const user = UserFactory.createInstance();
    await repository.save(user);

    const result = await useCase.run({ id: user.id.value });

    expect(result.isValid).toBe(true);
    const users = result.getValue();
    expect(users.id.value).toBe(user.id.value);
  });
});
