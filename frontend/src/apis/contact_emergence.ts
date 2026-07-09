import type { AxiosError } from 'axios';
import { apiPrivate } from './axios';
import type { BackendErrorResponse } from '../types/types';

export interface ContactEmergenceData {
  id: string;
  userId: string;
  name: string;
  parentesco: string;
  telefono?: string;
}

export const contactEmergenceApi = {
  async getAll(): Promise<ContactEmergenceData[]> {
    try {
      const response = await apiPrivate.get('/contact-emergence');
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al obtener contactos');
    }
  },

  async create(data: { name: string; parentesco: string; telefono?: string }): Promise<ContactEmergenceData> {
    try {
      const response = await apiPrivate.post('/contact-emergence', data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al crear contacto');
    }
  },

  async update(id: string, data: { name?: string; parentesco?: string; telefono?: string }): Promise<ContactEmergenceData> {
    try {
      const response = await apiPrivate.patch(`/contact-emergence/${id}`, data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al actualizar contacto');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiPrivate.delete(`/contact-emergence/${id}`);
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al eliminar contacto');
    }
  },
};
