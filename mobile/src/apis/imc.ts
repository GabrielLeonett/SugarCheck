import { apiPrivate } from './axios';
import type { PhysicalRecord } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  TO_SYNC_RECORD,
  FROM_SYNC_RECORD,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'imc';

export const imcApi = {
  async getAll(): Promise<PhysicalRecord[]> {
    const res = await apiPrivate.get('/imc');
    return res.data as PhysicalRecord[];
  },

  async create(dto: { peso: number; estatura: number; fecha: string }): Promise<PhysicalRecord> {
    const res = await apiPrivate.post('/imc', dto);
    return res.data as PhysicalRecord;
  },
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*  PROTOCOLO DE SINCRONIZACIÓN                                                */
/*─────────────────────────────────────────────────────────────────────────────*/

export async function syncPullImc(): Promise<PhysicalRecord[]> {
  const deltas = await pullChanges();
  const delta = deltas[TABLE];
  if (!delta) return [];

  return [
    ...(delta.created ?? []),
    ...(delta.updated ?? []),
  ].map((rec) => FROM_SYNC_RECORD[TABLE](rec) as PhysicalRecord);
}

export function syncSaveImc(rec: PhysicalRecord, op: 'created' | 'updated' = 'created'): void {
  const alturaM = rec.estatura / 100;
  const imcValue = rec.peso / (alturaM * alturaM);
  const syncRec = makeSyncRecord(
    rec.id,
    {
      peso: rec.peso,
      altura: rec.estatura,
      fecha: rec.fecha,
      imcValue: Number(imcValue.toFixed(1)),
    },
    Date.now(),
    Date.now(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export function syncDeleteImc(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

export async function syncPushImc() {
  return pushChanges();
}
