import { apiPrivate } from './axios';
import type { User } from '../types';

export const userApi = {
  async getById(id: string): Promise<User> {
    const response = await apiPrivate.get(`/user/id/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<{ name: string; email: string; sexo: string; fechaNacimiento: string }>): Promise<User> {
    const response = await apiPrivate.patch(`/user/${id}`, data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPrivate.patch('/user/password', { currentPassword, newPassword });
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/user/${id}`);
  },
};
