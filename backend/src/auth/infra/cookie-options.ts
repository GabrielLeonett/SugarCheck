import type { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Opciones de cookie para los tokens de autenticación.
 * En producción se requiere HTTPS y `sameSite: 'none'` para permitir
 * peticiones cross-site desde el frontend y el móvil.
 */
export function buildAuthCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}

export const cookieOptionsAccessToken = buildAuthCookieOptions(ACCESS_TOKEN_MAX_AGE_MS);
export const cookieOptionsRefreshToken = buildAuthCookieOptions(REFRESH_TOKEN_MAX_AGE_MS);
