import { apiPublic, apiPrivate } from './axios';
import type { User } from '../types';

interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  sexo: string;
  fechaNacimiento: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiPublic.post('/auth/login', { email, password });
    return response.data;
  },

  async refresh(): Promise<LoginResponse> {
    const response = await apiPrivate.post('/auth/refresh', {});
    return response.data;
  },

  async logout(): Promise<void> {
    await apiPrivate.post('/auth/logout', {});
  },

  async firebaseLogin(token: string): Promise<LoginResponse> {
    const response = await apiPrivate.post('/auth/firebase-login', { token });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiPublic.post('/auth/forgot-password', { email });
  },

  async register(data: RegisterPayload): Promise<LoginResponse> {
    const response = await apiPublic.post('/user/register', {
      name: data.nombre,
      email: data.email,
      password: data.password,
      sexo: data.sexo,
      fechaNacimiento: data.fechaNacimiento,
    });
    return response.data;
  },
};
