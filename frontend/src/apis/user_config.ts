import type { AxiosError } from 'axios';
import { apiPrivate } from './axios';
import type { BackendErrorResponse } from '../types/types';

export interface UserData {
  id: string;
  name: string;
  email: string;
  sexo: string;
  roles: string[];
  fechaNacimiento: Date;
  createdAt: Date;
}

export const userApi = {
  async getById(id: string): Promise<UserData> {
    try {
      const response = await apiPrivate.get(`/user/id/${id}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al obtener usuario');
    }
  },

  async update(id: string, data: Partial<{ name: string; email: string; sexo: string; fechaNacimiento: Date; password: string }>): Promise<UserData> {
    try {
      const response = await apiPrivate.patch(`/user/${id}`, data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiPrivate.delete(`/user/${id}`);
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al eliminar usuario');
    }
  },
};
