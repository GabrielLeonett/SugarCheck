import { apiPrivate } from './axios';

export interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  sexo: string;
  roles: string[];
  fechaNacimiento: Date;
  createdAt: Date;
}

export const userApi = {
  async getById(id: string): Promise<UserData> {
    const response = await apiPrivate.get(`/user/id/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<{ name: string; username: string; email: string; sexo: string; fechaNacimiento: Date; password: string }>): Promise<UserData> {
    const response = await apiPrivate.patch(`/user/${id}`, data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiPrivate.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/user/${id}`);
  },
};
