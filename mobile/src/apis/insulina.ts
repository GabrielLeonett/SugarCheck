import { apiPrivate } from './axios';
import type { InsulinRecord, DailyInsulinTotals, CreateInsulinDTO } from '../types';
import { createGuestId, useGuestStore } from '@/src/stores/guestStore';
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
    if (useGuestStore.getState().isGuestMode) {
      return useGuestStore.getState().records.insulin
        .map((record) => ({
          id: record.id,
          userId: useGuestStore.getState().profile?.id ?? '',
          tipo: String(record.tipo),
          dosis: Number(record.dosis),
          unidades: Number(record.unidades),
          fecha: String(record.fecha),
          hora: String(record.hora),
          zona: String(record.zona),
          zonaLabel: String(record.zona),
          contexto: record.contexto == null ? null : String(record.contexto),
          contextoLabel: record.contexto == null ? null : String(record.contexto),
          createdAt: String(record.createdAt),
        }))
        .filter((record) => !params?.tipo || record.tipo === params.tipo)
        .filter((record) => !params?.startDate || record.fecha >= params.startDate)
        .filter((record) => !params?.endDate || record.fecha <= params.endDate)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

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
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      const now = new Date();
      const date = new Date(dto.anio, dto.mes - 1, dto.dia);
      const record: InsulinRecord = {
        id: createGuestId(),
        userId: guest.profile.id,
        tipo: dto.tipo,
        dosis: dto.dosis,
        unidades: dto.dosis,
        fecha: date.toISOString(),
        hora: dto.hora,
        zona: dto.zona,
        zonaLabel: dto.zona,
        contexto: dto.contexto ?? null,
        contextoLabel: dto.contexto ?? null,
        createdAt: now.toISOString(),
      };
      await guest.saveRecord('insulin', {
        id: record.id,
        tipo: record.tipo,
        dosis: record.dosis,
        unidades: record.unidades,
        fecha: record.fecha,
        hora: record.hora,
        zona: record.zona,
        contexto: record.contexto,
        createdAt: record.createdAt,
      });
      return record;
    }

    const res = await apiPrivate.post('/insulina', dto);
    return res.data as InsulinRecord;
  },

  async getTotals(): Promise<DailyInsulinTotals> {
    if (useGuestStore.getState().isGuestMode) {
      const today = new Date().toDateString();
      const todayRecords = useGuestStore.getState().records.insulin.filter(
        (record) => new Date(String(record.fecha)).toDateString() === today,
      );
      const totalRapida = todayRecords
        .filter((record) => record.tipo === 'RAPIDA')
        .reduce((sum, record) => sum + Number(record.dosis), 0);
      const totalLenta = todayRecords
        .filter((record) => record.tipo === 'LENTA')
        .reduce((sum, record) => sum + Number(record.dosis), 0);
      return { totalRapida, totalLenta, totalGeneral: totalRapida + totalLenta };
    }

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
