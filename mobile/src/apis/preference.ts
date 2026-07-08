import { apiPrivate } from './axios';
import type { Preference } from '../types';

export const preferenceApi = {
  async getPreferences(): Promise<Preference> {
    const res = await apiPrivate.get('/preference');
    return res.data?.data as Preference;
  },

  async savePreferences(payload: Preference): Promise<Preference> {
    const { userId: _, locale: _l, theme: _t, ...dtoPayload } = payload as any;
    const res = await apiPrivate.post('/preference', dtoPayload);
    return res.data?.data as Preference;
  },
};
