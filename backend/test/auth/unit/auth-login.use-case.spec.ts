import { JwtService } from '@nestjs/jwt';
import { Result } from '../../../src/shared/result';
import { LoginUser } from '../../../src/auth/app/LoginUser';
import { LoginFirebaseUser } from '../../../src/auth/app/LoginFirebaseUser';
import { Logout } from '../../../src/auth/app/LogoutUser';
import { RefreshAccessToken } from '../../../src/auth/app/RefreshAccessToken';
import { BcryptHasher } from '../../user/mocks/hasher.mock';
import {
  makeFakeUser,
  StubGetOneByUsernameUser,
  StubGetOneByEmailUser,
  StubGetOneByIdUser,
  StubSaveUser,
} from '../mocks/auth-ports.mock';

const JWT_SECRET = 'test-secret';
const PASSWORD = 'Password123';

describe('LoginUser UseCase', () => {
  let getOneByUsername: StubGetOneByUsernameUser;
  let useCase: LoginUser;

  beforeEach(() => {
    getOneByUsername = new StubGetOneByUsernameUser();
    useCase = new LoginUser(
      getOneByUsername as any,
      new BcryptHasher() as any,
      new JwtService({ secret: JWT_SECRET }),
    );
  });

  test('loguea un usuario con credenciales válidas', async () => {
    const hashed = await new BcryptHasher().hash(PASSWORD);
    getOneByUsername.response = Result.ok(makeFakeUser({ password: hashed }));

    const result = await useCase.run({
      username: 'gabrieltest',
      password: PASSWORD,
    });

    expect(result.isValid).toBe(true);
    const value = result.getValue();
    expect(typeof value.at).toBe('string');
    expect(typeof value.rt).toBe('string');
    expect(value.user.password).toBeUndefined();
    expect(value.user.username).toBe('gabrieltest');
  });

  test('falla si el usuario no existe', async () => {
    const result = await useCase.run({
      username: 'fantasma',
      password: PASSWORD,
    });
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('Credenciales');
  });

  test('falla si la contraseña no coincide', async () => {
    const hashed = await new BcryptHasher().hash('OtraClave456');
    getOneByUsername.response = Result.ok(makeFakeUser({ password: hashed }));

    const result = await useCase.run({
      username: 'gabrieltest',
      password: PASSWORD,
    });

    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('Credenciales');
  });

  test('los tokens firmados contienen el sub del usuario', async () => {
    const hashed = await new BcryptHasher().hash(PASSWORD);
    getOneByUsername.response = Result.ok(makeFakeUser({ password: hashed }));
    const jwtService = new JwtService({ secret: JWT_SECRET });

    const result = await useCase.run({
      username: 'gabrieltest',
      password: PASSWORD,
    });
    const payload = jwtService.verify(result.getValue().at);

    expect(payload.sub).toBe('11111111-1111-4111-8111-111111111111');
  });
});

describe('LoginFirebaseUser UseCase', () => {
  let getOneByEmail: StubGetOneByEmailUser;
  let saveUser: StubSaveUser;
  let useCase: LoginFirebaseUser;

  beforeEach(() => {
    getOneByEmail = new StubGetOneByEmailUser();
    saveUser = new StubSaveUser();
    useCase = new LoginFirebaseUser(
      getOneByEmail as any,
      saveUser as any,
      new JwtService({ secret: JWT_SECRET }),
    );
  });

  test('usuario existente: no crea nuevo usuario (isNewUser=false)', async () => {
    getOneByEmail.response = Result.ok(makeFakeUser());

    const result = await useCase.run({
      email: 'gabriel@test.com',
      name: 'Gabriel Test',
      firebaseUid: 'firebase-uid-123',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().isNewUser).toBe(false);
    expect(saveUser.calls).toHaveLength(0);
  });

  test('usuario nuevo: lo registra y devuelve isNewUser=true', async () => {
    const result = await useCase.run({
      email: 'nuevo@test.com',
      name: 'Nuevo Usuario',
      firebaseUid: 'firebase-uid-456',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().isNewUser).toBe(true);
    expect(saveUser.calls).toHaveLength(1);
    expect(saveUser.calls[0].username).toMatch(/^[a-zA-Z]/);
  });
});

describe('Logout UseCase', () => {
  test('siempre retorna éxito', async () => {
    const useCase = new Logout();
    const result = await useCase.run();
    expect(result.isValid).toBe(true);
  });
});

describe('RefreshAccessToken UseCase', () => {
  let getOneById: StubGetOneByIdUser;
  let jwtService: JwtService;
  let useCase: RefreshAccessToken;

  beforeEach(() => {
    getOneById = new StubGetOneByIdUser();
    jwtService = new JwtService({ secret: JWT_SECRET });
    useCase = new RefreshAccessToken(
      jwtService,
      { get: () => JWT_SECRET } as any,
      getOneById as any,
    );
  });

  test('renueva los tokens con un refresh token válido', async () => {
    getOneById.response = Result.ok(makeFakeUser());
    const rt = await jwtService.signAsync({
      sub: '11111111-1111-4111-8111-111111111111',
    });

    const result = await useCase.run(rt);

    expect(result.isValid).toBe(true);
    expect(typeof result.getValue().at).toBe('string');
    expect(typeof result.getValue().rt).toBe('string');
  });

  test('falla con un refresh token inválido', async () => {
    const result = await useCase.run('token-basura');
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('expir');
  });

  test('falla si el usuario ya no existe', async () => {
    const rt = await jwtService.signAsync({
      sub: '99999999-9999-4999-8999-999999999999',
    });
    const result = await useCase.run(rt);
    expect(result.isValid).toBe(false);
    expect(result.getError().message).toContain('inicia sesión');
  });
});
