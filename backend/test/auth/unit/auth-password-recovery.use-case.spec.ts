import { Result } from '../../../src/shared/result';
import { ForgotPassword } from '../../../src/auth/app/ForgotPassword';
import { ResetPassword } from '../../../src/auth/app/ResetPassword';
import { BcryptHasher } from '../../user/mocks/hasher.mock';
import {
  makeFakeUser,
  StubGetOneByEmailUser,
  StubUpdatePassword,
  StubEmailService,
  InMemoryResetCodeStore,
} from '../mocks/auth-ports.mock';

describe('ForgotPassword UseCase', () => {
  let getOneByEmail: StubGetOneByEmailUser;
  let emailService: StubEmailService;
  let resetCodeStore: InMemoryResetCodeStore;
  let useCase: ForgotPassword;

  beforeEach(() => {
    getOneByEmail = new StubGetOneByEmailUser();
    emailService = new StubEmailService();
    resetCodeStore = new InMemoryResetCodeStore();
    useCase = new ForgotPassword(
      getOneByEmail as any,
      emailService as any,
      resetCodeStore as any,
    );
  });

  test('genera y almacena el código y envía el correo', async () => {
    getOneByEmail.response = Result.ok(makeFakeUser());

    const result = await useCase.run({ email: 'gabriel@test.com' });

    expect(result.isValid).toBe(true);
    expect(result.getValue().message).toBeTruthy();
    expect(resetCodeStore.entries.size).toBe(1);
    const stored = resetCodeStore.entries.get('gabriel@test.com');
    expect(stored).toMatch(/^\d{6}$/);
    expect(emailService.calls).toHaveLength(1);
    expect(emailService.calls[0].code).toBe(stored);
  });

  test('responde de forma neutra aunque el email no exista (no revela usuarios)', async () => {
    const result = await useCase.run({ email: 'fantasma@test.com' });

    expect(result.isValid).toBe(true);
    expect(resetCodeStore.entries.size).toBe(1);
    expect(emailService.calls).toHaveLength(1);
  });
});

describe('ResetPassword UseCase', () => {
  let getOneByEmail: StubGetOneByEmailUser;
  let updatePassword: StubUpdatePassword;
  let resetCodeStore: InMemoryResetCodeStore;
  let useCase: ResetPassword;

  const PASSWORD = 'NuevaClave123';

  beforeEach(() => {
    getOneByEmail = new StubGetOneByEmailUser();
    updatePassword = new StubUpdatePassword();
    resetCodeStore = new InMemoryResetCodeStore();
    useCase = new ResetPassword(
      getOneByEmail as any,
      updatePassword as any,
      new BcryptHasher() as any,
      resetCodeStore as any,
    );
  });

  test('restablece la contraseña con un código válido', async () => {
    await resetCodeStore.store('gabriel@test.com', '123456');
    getOneByEmail.response = Result.ok(makeFakeUser());

    const result = await useCase.run({
      email: 'gabriel@test.com',
      code: '123456',
      password: PASSWORD,
    });

    expect(result.isValid).toBe(true);
    expect(updatePassword.calls).toHaveLength(1);
    expect(updatePassword.calls[0].id).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
    // el hash almacenado NO es la contraseña plana
    expect(updatePassword.calls[0].hashedPassword).not.toBe(PASSWORD);
  });

  test('falla con un código inválido', async () => {
    await resetCodeStore.store('gabriel@test.com', '123456');

    const result = await useCase.run({
      email: 'gabriel@test.com',
      code: '000000',
      password: PASSWORD,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().message.toLowerCase()).toContain('código');
  });

  test('falla con una contraseña débil (sin número)', async () => {
    await resetCodeStore.store('gabriel@test.com', '123456');

    const result = await useCase.run({
      email: 'gabriel@test.com',
      code: '123456',
      password: 'soloLetras',
    });

    expect(result.isValid).toBe(false);
    expect(updatePassword.calls).toHaveLength(0);
  });

  test('falla con una contraseña corta', async () => {
    await resetCodeStore.store('gabriel@test.com', '123456');

    const result = await useCase.run({
      email: 'gabriel@test.com',
      code: '123456',
      password: 'Ab1',
    });

    expect(result.isValid).toBe(false);
  });
});
