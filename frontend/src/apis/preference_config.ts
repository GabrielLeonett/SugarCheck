import type { Preference } from '../schemas/preference_config';
import type { BackendErrorsApi } from '../types/types';
import { apiPrivate } from './axios';

export const preferenceApi = {
  // Obtener: Llama directamente a la API
  async getPreferences(): Promise<Preference> {
    try {
      // El interceptor ya devuelve el objeto 'data' directamente
      return await apiPrivate.get('/preference') as Preference;
    } catch (error) {
      const err = error as BackendErrorsApi;
      console.error(`Error fetching preferences [${err.statusCode}]:`, err.message);
      throw err; // Lanzamos el error para que el store decida cómo manejarlo
    }
  },

  // Guardar: Llama directamente a la API
  async savePreferences(payload: Preference): Promise<Preference> {
    try {
      return await apiPrivate.post('/preference', payload) as Preference;
    } catch (error) {
      const err = error as BackendErrorsApi;
      console.error(`Error saving preferences [${err.statusCode}]:`, err.message);
      throw err;
    }
  }
};