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

/**
 * Opciones para *borrar* las cookies de autenticación.
 *
 * Deben coincidir exactamente con las usadas al crearlas (salvo `maxAge`):
 * cuando el frontend y el backend están en dominios distintos, el navegador
 * solo acepta el `Set-Cookie` de borrado si llega con `SameSite=None; Secure`.
 * Si se envía con `SameSite=Strict` la cookie original sobrevive y la sesión
 * se "resucita" al recargar la página.
 */
export function clearAuthCookieOptions(): CookieOptions {
  const options = buildAuthCookieOptions(REFRESH_TOKEN_MAX_AGE_MS);
  delete options.maxAge;
  return options;
}

export const cookieOptionsAccessToken = buildAuthCookieOptions(ACCESS_TOKEN_MAX_AGE_MS);
export const cookieOptionsRefreshToken = buildAuthCookieOptions(REFRESH_TOKEN_MAX_AGE_MS);
