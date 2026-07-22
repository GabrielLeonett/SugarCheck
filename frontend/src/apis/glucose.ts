import { apiPrivate } from './axios';
import type { GlucosaRecord } from '../data/recordsMock';

interface GlucoseBackendRecord {
  id: string;
  userId: string;
  valueMgdl: number;
  mealTag: string;
  date: string;
  time: string;
  createdAt: string;
  alert: string | null;
}

function formatHourLabel(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12} : ${minutes} ${period}`;
}

const DEFAULT_HYPO = 70;
const DEFAULT_HIPER = 180;

function deriveEstado(
  valueMgdl: number,
  alert: string | null,
  thresholds?: { hypo: number; hiper: number }
): 'Normal' | 'Alto' | 'Bajo' {
  if (alert === 'ALERT_HYPO') return 'Bajo';
  if (alert === 'ALERT_HYPER') return 'Alto';
  if (thresholds) {
    if (valueMgdl <= thresholds.hypo) return 'Bajo';
    if (valueMgdl >= thresholds.hiper) return 'Alto';
  } else {
    if (valueMgdl <= DEFAULT_HYPO) return 'Bajo';
    if (valueMgdl >= DEFAULT_HIPER) return 'Alto';
  }
  return 'Normal';
}

function mapGlucoseRecord(
  item: GlucoseBackendRecord,
  thresholds?: { hypo: number; hiper: number }
): GlucosaRecord {
  return {
    id: item.id,
    fechaISO: item.date,
    hora: formatHourLabel(item.time),
    nivel: item.valueMgdl,
    contexto: item.mealTag,
    estado: deriveEstado(item.valueMgdl, item.alert, thresholds),
  };
}

export interface CreateGlucosePayload {
  valueMgdl: number;
  mealTag: string;
  date: string;
  time: string;
}

export const glucoseApi = {
  async getAll(
    thresholds?: { hypo: number; hiper: number }
  ): Promise<GlucosaRecord[]> {
    const res = await apiPrivate.get('/glucose');
    const data = res.data as GlucoseBackendRecord[];
    return data.map((item) => mapGlucoseRecord(item, thresholds));
  },

  async create(
    payload: CreateGlucosePayload,
    thresholds?: { hypo: number; hiper: number }
  ): Promise<{ record: GlucosaRecord; alert: string | null }> {
    const res = await apiPrivate.post('/glucose', payload);
    const item = res.data as GlucoseBackendRecord;
    return {
      record: mapGlucoseRecord(item, thresholds),
      alert: item.alert,
    };
  },
};
