import { HttpException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import {
  ForgotPasswordRateLimitGuard,
  ResetPasswordRateLimitGuard,
} from '../../../src/auth/infra/auth-rate-limit.guard';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';

function makeContext(email: string, ip = '127.0.0.1'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        body: { email },
        ip,
        headers: { 'accept-language': 'es' },
        socket: {},
      }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('Rate limit de recuperación de contraseña', () => {
  test('forgot-password permite 5 solicitudes y bloquea la sexta', () => {
    const guard = new ForgotPasswordRateLimitGuard(new TranslationService());
    const context = makeContext('gabriel@test.com');

    for (let request = 0; request < 5; request += 1) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  test('el límite se aplica por email', () => {
    const guard = new ForgotPasswordRateLimitGuard(new TranslationService());

    for (let request = 0; request < 5; request += 1) {
      expect(guard.canActivate(makeContext('uno@test.com'))).toBe(true);
    }

    expect(guard.canActivate(makeContext('dos@test.com'))).toBe(true);
  });

  test('reset-password permite 10 intentos y bloquea el undécimo', () => {
    const guard = new ResetPasswordRateLimitGuard(new TranslationService());
    const context = makeContext('gabriel@test.com');

    for (let request = 0; request < 10; request += 1) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });
});
