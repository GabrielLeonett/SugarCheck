import { apiPrivate } from './axios';
import type { User } from '../types';

export const userApi = {
  async getById(id: string): Promise<User> {
    const response = await apiPrivate.get(`/user/id/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<{ name: string; email: string; sexo: string; fechaNacimiento: string; password: string }>): Promise<User> {
    const response = await apiPrivate.patch(`/user/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/user/${id}`);
  },
};
