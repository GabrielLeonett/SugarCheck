import { apiPublic, apiPrivate, BASE_URL } from './axios';
import type { User } from '../types';

interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  isNewUser?: boolean;
}

interface RegisterPayload {
  nombre: string;
  username: string;
  email: string;
  password: string;
  sexo: string;
  fechaNacimiento: string;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiPublic.post('/auth/login', { username, password });
    return response.data;
  },

  async refresh(): Promise<LoginResponse> {
    const response = await apiPrivate.post('/auth/refresh', {}, { timeout: 3000 });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiPrivate.post('/auth/logout', {});
  },

  async firebaseLogin(token: string): Promise<LoginResponse> {
    const response = await apiPrivate.post('/auth/firebase-login', { token });
    return response.data;
  },

  /**
   * URL del backend que inicia el flujo OAuth en el navegador del sistema.
   * El backend termina redirigiendo al deep link de la app con un código
   * de un solo uso.
   */
  oauthStartUrl(provider: 'google' | 'facebook', redirectUri: string): string {
    return `${BASE_URL}/auth/oauth/${provider}/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  async exchangeOAuthCode(code: string): Promise<LoginResponse> {
    const response = await apiPublic.post('/auth/oauth/exchange', { code });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiPublic.post('/auth/forgot-password', { email });
  },

  async register(data: RegisterPayload): Promise<LoginResponse> {
    const response = await apiPublic.post('/user/register', {
      name: data.nombre,
      username: data.username,
      email: data.email,
      password: data.password,
      sexo: data.sexo,
      fechaNacimiento: data.fechaNacimiento,
    });
    return response.data;
  },
};
