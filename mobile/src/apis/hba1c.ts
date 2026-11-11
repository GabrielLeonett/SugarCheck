import { apiPrivate } from './axios';
import type { HbA1cRecord } from '../types';
import { createGuestId, useGuestStore } from '@/src/stores/guestStore';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  FROM_SYNC_RECORD,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'hba1c';

interface HbA1cBackendRecord {
  id: string;
  valuePercent: number;
  examDate: string;
}

function mapRecord(record: HbA1cBackendRecord): HbA1cRecord {
  const date = new Date(record.examDate);
  return {
    id: record.id,
    resultado: record.valuePercent,
    fecha: date.toLocaleDateString('es-ES'),
  };
}

export const hba1cApi = {
  async getAll(): Promise<HbA1cRecord[]> {
    if (useGuestStore.getState().isGuestMode) {
      return [...useGuestStore.getState().records.hba1c]
        .sort((a, b) => String(b.examDate).localeCompare(String(a.examDate)))
        .map((record) => ({
          id: record.id,
          resultado: Number(record.valuePercent),
          fecha: new Date(String(record.examDate)).toLocaleDateString('es-ES'),
        }));
    }

    const res = await apiPrivate.get('/hba1c');
    return (res.data as HbA1cBackendRecord[]).map(mapRecord);
  },

  async create(dto: { resultado: number; fecha: string }): Promise<HbA1cRecord> {
    if (useGuestStore.getState().isGuestMode) {
      const record: HbA1cRecord = {
        id: createGuestId(),
        resultado: dto.resultado,
        fecha: new Date(dto.fecha).toLocaleDateString('es-ES'),
      };
      await useGuestStore.getState().saveRecord('hba1c', {
        id: record.id,
        valuePercent: dto.resultado,
        examDate: dto.fecha,
        createdAt: new Date().toISOString(),
      });
      return record;
    }

    const res = await apiPrivate.post('/hba1c', {
      valuePercent: dto.resultado,
      examDate: dto.fecha,
    });
    return mapRecord(res.data as HbA1cBackendRecord);
  },
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*  PROTOCOLO DE SINCRONIZACIÓN                                                */
/*─────────────────────────────────────────────────────────────────────────────*/

export async function syncPullHbA1c(): Promise<HbA1cRecord[]> {
  const deltas = await pullChanges();
  const delta = deltas[TABLE];
  if (!delta) return [];

  return [
    ...(delta.created ?? []),
    ...(delta.updated ?? []),
  ].map((rec) => FROM_SYNC_RECORD[TABLE](rec) as HbA1cRecord);
}

export function syncSaveHbA1c(rec: HbA1cRecord, op: 'created' | 'updated' = 'created'): void {
  const syncRec = makeSyncRecord(
    rec.id,
    {
      valuePercent: rec.resultado,
      examDate: rec.fecha,
    },
    Date.now(),
    Date.now(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export function syncDeleteHbA1c(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

export async function syncPushHbA1c() {
  return pushChanges();
}
