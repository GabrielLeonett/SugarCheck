import { apiPrivate } from './axios';
import type { HbA1cRecord } from '../data/recordsMock';

interface HbA1cBackendRecord {
  id: string;
  userId: string;
  valuePercent: number;
  eag: number;
  examDate: string;
  createdAt: string;
  estado: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const aaaa = date.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}

function deriveHealthEstado(valuePercent: number): 'En Meta' | 'Elevado' | 'Alto' {
  if (valuePercent < 7) return 'En Meta';
  if (valuePercent < 9) return 'Elevado';
  return 'Alto';
}

function mapHbA1cRecord(item: HbA1cBackendRecord): HbA1cRecord {
  return {
    id: item.id,
    fechaISO: item.examDate,
    fecha: formatDate(item.examDate),
    resultado: item.valuePercent,
    estimado: `${Math.round(item.eag)} mg/dL`,
    estado: deriveHealthEstado(item.valuePercent),
  };
}

export interface CreateHbA1cPayload {
  valuePercent: number;
  examDate: string;
}

export const hba1cApi = {
  async getAll(): Promise<HbA1cRecord[]> {
    const res = await apiPrivate.get('/hba1c');
    const data = res.data as HbA1cBackendRecord[];
    return data.map(mapHbA1cRecord);
  },

  async create(payload: CreateHbA1cPayload): Promise<HbA1cRecord> {
    const res = await apiPrivate.post('/hba1c', payload);
    return mapHbA1cRecord(res.data as HbA1cBackendRecord);
  },
};
