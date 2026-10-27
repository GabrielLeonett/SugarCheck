import { apiPrivate } from './axios';
import type { GlucoseRecord } from '../types';

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

export interface GlucoseEntry extends GlucoseRecord {
  timestamp: Date;
}

function formatFecha(dateISO: string): string {
  const date = new Date(dateISO);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function formatHora(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function mapRecord(item: GlucoseBackendRecord): GlucoseEntry {
  const datePart = item.date.slice(0, 10);
  return {
    id: item.id,
    nivel: item.valueMgdl,
    contexto: item.mealTag,
    fecha: formatFecha(item.date),
    hora: formatHora(item.time),
    timestamp: new Date(`${datePart}T${item.time}:00`),
  };
}

export const glucoseApi = {
  async getAll(): Promise<GlucoseEntry[]> {
    const res = await apiPrivate.get('/glucose');
    const data = res.data as GlucoseBackendRecord[];
    return data
      .map(mapRecord)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
};
