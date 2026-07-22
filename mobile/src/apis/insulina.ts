import { apiPrivate } from './axios';
import type { InsulinRecord, DailyInsulinTotals, CreateInsulinDTO } from '../types';

export const insulinaApi = {
  async getAll(params?: { tipo?: string; startDate?: string; endDate?: string }): Promise<InsulinRecord[]> {
    const queryParams = new URLSearchParams();
    if (params?.tipo) queryParams.set('tipo', params.tipo);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const query = queryParams.toString();
    const url = query ? `/insulina?${query}` : '/insulina';

    const res = await apiPrivate.get(url);
    return res.data as InsulinRecord[];
  },

  async create(dto: CreateInsulinDTO): Promise<InsulinRecord> {
    const res = await apiPrivate.post('/insulina', dto);
    return res.data as InsulinRecord;
  },

  async getTotals(): Promise<DailyInsulinTotals> {
    const res = await apiPrivate.get('/insulina/totals');
    return res.data as DailyInsulinTotals;
  },
};
