import type { Preference } from '../schemas/preference_config';
import type { BackendErrorsApi } from '../types/types';
import { apiPrivate } from './axios';

export const preferenceApi = {
  async getPreferences(): Promise<Preference> {
    try {
      const res = await apiPrivate.get('/preference');
      return res.data?.data as Preference;
    } catch (error) {
      const err = error as BackendErrorsApi;
      console.error(`Error fetching preferences [${err.statusCode}]:`, err.message);
      throw err;
    }
  },

  async savePreferences(payload: Preference): Promise<Preference> {
    try {
      const { userId: _, locale: _l, theme: _t, ...dtoPayload } = payload;
      const res = await apiPrivate.post('/preference', dtoPayload);
      return res.data?.data as Preference;
    } catch (error) {
      const err = error as BackendErrorsApi;
      console.error(`Error saving preferences [${err.statusCode}]:`, err.message);
      throw err;
    }
  }
};