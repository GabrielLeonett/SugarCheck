import { AuthController } from '../../../src/auth/infra/auth.controller';
import {
  cookieOptionsAccessToken,
  cookieOptionsRefreshToken,
} from '../../../src/auth/infra/cookie-options';

describe('AuthController logout', () => {
  const translationService = {
    resolveLanguage: () => 'es',
    translate: (key: string) => key,
  };

  const firebaseAdminService = {
    verifyIdToken: jest.fn(),
  };

  function buildController(authService: { logout: jest.Mock }) {
    return new AuthController(
      authService as any,
      firebaseAdminService as any,
      translationService as any,
    );
  }

  function buildResponse() {
    const clearCookie = jest.fn();
    const cookie = jest.fn();
    return { res: { clearCookie, cookie } as any, clearCookie, cookie };
  }

  test('borra access_token y refresh_token con los mismos atributos con que se crearon', async () => {
    const authService = { logout: jest.fn().mockResolvedValue(undefined) };
    const controller = buildController(authService);
    const { res, clearCookie } = buildResponse();
    const req = { cookies: { refresh_token: 'rt' }, headers: {} } as any;

    await controller.logout(req, res);

    expect(clearCookie).toHaveBeenCalledTimes(2);

    const [accessName, accessOptions] = clearCookie.mock.calls[0];
    const [refreshName, refreshOptions] = clearCookie.mock.calls[1];

    expect(accessName).toBe('access_token');
    expect(refreshName).toBe('refresh_token');

    // Mismos atributos que al crear la cookie (salvo maxAge): si difieren,
    // el navegador ignora el borrado en peticiones cross-site.
    const expected = { ...cookieOptionsRefreshToken } as any;
    delete expected.maxAge;

    expect(accessOptions).toEqual(expected);
    expect(refreshOptions).toEqual(expected);
    expect(refreshOptions.maxAge).toBeUndefined();
    expect(cookieOptionsAccessToken.sameSite).toBe(refreshOptions.sameSite);
    expect(cookieOptionsAccessToken.secure).toBe(refreshOptions.secure);
  });

  test('revoca el refresh token presentado', async () => {
    const authService = { logout: jest.fn().mockResolvedValue(undefined) };
    const controller = buildController(authService);
    const { res } = buildResponse();
    const req = { cookies: { refresh_token: 'rt-presentado' }, headers: {} } as any;

    await controller.logout(req, res);

    expect(authService.logout).toHaveBeenCalledWith('rt-presentado');
  });

  test('borra las cookies aunque falle la revocación en la base de datos', async () => {
    const authService = {
      logout: jest.fn().mockRejectedValue(new Error('db caída')),
    };
    const controller = buildController(authService);
    const { res, clearCookie } = buildResponse();
    const req = { cookies: { refresh_token: 'rt' }, headers: {} } as any;

    const result = await controller.logout(req, res);

    expect(result).toEqual({ message: 'LOGOUT_SUCCESS' });
    expect(clearCookie).toHaveBeenCalledTimes(2);
  });

  test('funciona sin cookie de refresh', async () => {
    const authService = { logout: jest.fn() };
    const controller = buildController(authService);
    const { res, clearCookie } = buildResponse();
    const req = { cookies: {}, headers: {} } as any;

    await controller.logout(req, res);

    expect(authService.logout).not.toHaveBeenCalled();
    expect(clearCookie).toHaveBeenCalledTimes(2);
  });
});
