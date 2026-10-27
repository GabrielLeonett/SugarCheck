import { randomUUID } from 'node:crypto';
import { InMemoryUserRepository } from '../mocks/user-repository.mock';
import { UserFactory } from '../fixtures/user.fixture';
import { BcryptHasher } from '../mocks/hasher.mock';
import { ChangePassword } from '../../../src/user/app/ChangePassword';
import { User } from '../../../src/user/core/User';

describe('ChangePassword UseCase', () => {
  const CURRENT_PASSWORD = 'Password123';
  const NEW_PASSWORD = 'NewPassword456';

  let repository: InMemoryUserRepository;
  let hasher: BcryptHasher;
  let useCase: ChangePassword;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    hasher = new BcryptHasher();
    useCase = new ChangePassword(repository, hasher);
  });

  const createStoredUser = async (): Promise<User> => {
    const user = UserFactory.createInstance({
      password: await hasher.hash(CURRENT_PASSWORD),
    });
    await repository.save(user);
    return user;
  };

  test('cambia la contraseña cuando la contraseña actual es correcta', async () => {
    const user = await createStoredUser();

    const result = await useCase.run({
      userId: user.id.value,
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect(result.isValid).toBe(true);

    const stored = await repository.getOneById(user.id);
    expect(stored.isValid).toBe(true);

    const storedPassword = stored.getValue().password.value;
    await expect(hasher.compare(NEW_PASSWORD, storedPassword)).resolves.toBe(
      true,
    );
    await expect(
      hasher.compare(CURRENT_PASSWORD, storedPassword),
    ).resolves.toBe(false);
  });

  test('rechaza el cambio si la contraseña actual es incorrecta', async () => {
    const user = await createStoredUser();

    const result = await useCase.run({
      userId: user.id.value,
      currentPassword: 'WrongPassword123',
      newPassword: NEW_PASSWORD,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().code).toBe('PASSWORD_CURRENT_INVALID');
    expect(result.getError().field).toBe('currentPassword');

    const stored = await repository.getOneById(user.id);
    await expect(
      hasher.compare(CURRENT_PASSWORD, stored.getValue().password.value),
    ).resolves.toBe(true);
  });

  test('rechaza el cambio si la nueva contraseña es igual a la actual', async () => {
    const user = await createStoredUser();

    const result = await useCase.run({
      userId: user.id.value,
      currentPassword: CURRENT_PASSWORD,
      newPassword: CURRENT_PASSWORD,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().code).toBe('PASSWORD_SAME_AS_CURRENT');
    expect(result.getError().field).toBe('newPassword');
  });

  test('rechaza contraseñas nuevas que no cumplen la política', async () => {
    const user = await createStoredUser();

    const tooShort = await useCase.run({
      userId: user.id.value,
      currentPassword: CURRENT_PASSWORD,
      newPassword: 'Ab1',
    });
    expect(tooShort.isValid).toBe(false);
    expect(tooShort.getError().code).toBe('PASSWORD_MIN_LENGTH');

    const withoutNumber = await useCase.run({
      userId: user.id.value,
      currentPassword: CURRENT_PASSWORD,
      newPassword: 'PasswordOnly',
    });
    expect(withoutNumber.isValid).toBe(false);
    expect(withoutNumber.getError().code).toBe('PASSWORD_REQUIRES_NUMBER');
  });

  test('falla si el usuario no existe', async () => {
    const result = await useCase.run({
      userId: randomUUID(),
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().name).toBe('UserNotFoundError');
  });
});
