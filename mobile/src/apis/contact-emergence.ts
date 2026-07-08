import type { AxiosError } from 'axios';
import { apiPrivate } from './axios';
import type { ContactEmergenceData, BackendErrorResponse } from '../types';

export const contactEmergenceApi = {
  async getAll(): Promise<ContactEmergenceData[]> {
    const response = await apiPrivate.get('/contact-emergence');
    return response.data;
  },

  async create(data: { name: string; parentesco: string; telefono?: string }): Promise<ContactEmergenceData> {
    const response = await apiPrivate.post('/contact-emergence', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; parentesco?: string; telefono?: string }): Promise<ContactEmergenceData> {
    const response = await apiPrivate.patch(`/contact-emergence/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/contact-emergence/${id}`);
  },
};
