import type { AxiosError } from 'axios';
import { apiPrivate } from './axios';
import type { BackendErrorResponse } from '../types/types';

export interface ImcData {
  id: string;
  userId: string;
  peso: number;
  altura: number;
  imcValue: number;
  categoria: string;
  fecha: string;
}

export const imcApi = {
  async getAll(): Promise<ImcData[]> {
    try {
      const response = await apiPrivate.get('/imc');
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al obtener registros de IMC');
    }
  },

  async create(data: { peso: number; altura: number; dia: number; mes: number; anio: number }): Promise<ImcData> {
    try {
      const response = await apiPrivate.post('/imc', data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al crear registro de IMC');
    }
  },

  async update(id: string, data: { peso?: number; altura?: number }): Promise<ImcData> {
    try {
      const response = await apiPrivate.patch(`/imc/${id}`, data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al actualizar registro de IMC');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiPrivate.delete(`/imc/${id}`);
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      throw new Error(err.response?.data?.message || 'Error al eliminar registro de IMC');
    }
  },
};
