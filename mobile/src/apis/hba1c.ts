import { apiPrivate } from './axios';
import type { HbA1cRecord } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  TO_SYNC_RECORD,
  FROM_SYNC_RECORD,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'hba1c';

export const hba1cApi = {
  async getAll(): Promise<HbA1cRecord[]> {
    const res = await apiPrivate.get('/hba1c');
    return res.data as HbA1cRecord[];
  },

  async create(dto: { resultado: number; fecha: string }): Promise<HbA1cRecord> {
    const res = await apiPrivate.post('/hba1c', dto);
    return res.data as HbA1cRecord;
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
