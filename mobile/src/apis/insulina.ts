import { apiPrivate } from './axios';
import type { InsulinRecord, DailyInsulinTotals, CreateInsulinDTO } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  getTableDelta,
  getFromSyncAdapter,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'insulina';

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

export async function syncPullInsulina(): Promise<InsulinRecord[]> {
  const deltas = await pullChanges();
  const delta = getTableDelta(deltas, TABLE);
  if (!delta) return [];

  const fromSync = getFromSyncAdapter(TABLE) as (rec: Record<string, unknown>) => InsulinRecord;

  return [
    ...(delta.created ?? []),
    ...(delta.updated ?? []),
  ]
    .map(fromSync)
    .sort((a: InsulinRecord, b: InsulinRecord) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function syncSaveInsulina(rec: InsulinRecord, op: 'created' | 'updated' = 'created'): void {
  const syncRec = makeSyncRecord(
    rec.id,
    {
      tipo: rec.tipo,
      dosis: rec.dosis,
      unidades: rec.unidades ?? rec.dosis,
      fecha: rec.fecha,
      hora: rec.hora,
      zona: rec.zona,
      contexto: rec.contexto ?? null,
    },
    new Date(rec.createdAt).getTime(),
    new Date(rec.createdAt).getTime(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export function syncDeleteInsulina(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

export async function syncPushInsulina() {
  return pushChanges();
}
