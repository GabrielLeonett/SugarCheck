import { apiPrivate } from './axios';
import type { ContactEmergenceData } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  getTableDelta,
  getFromSyncAdapter,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'contactEmergence';

export const contactEmergenceApi = {
  async getAll(): Promise<ContactEmergenceData[]> {
    const response = await apiPrivate.get('/contact-emergence');
    return response.data;
  },

  async create(data: { name: string; parentesco: string; telefono?: string }): Promise<ContactEmergenceData> {
    const response = await apiPrivate.post('/contact-emergence', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; parentesco?: string; telefono?: string }): Promise<ContactEmergenceData> {
    const response = await apiPrivate.patch(`/contact-emergence/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/contact-emergence/${id}`);
  },
};

export async function syncPullContactEmergence(): Promise<ContactEmergenceData[]> {
  const deltas = await pullChanges();
  const delta = getTableDelta(deltas, TABLE);
  if (!delta) return [];

  const fromSync = getFromSyncAdapter(TABLE) as (rec: Record<string, unknown>) => ContactEmergenceData;

  return [
    ...(delta.created ?? []),
    ...(delta.updated ?? []),
  ].map(fromSync);
}

export function syncSaveContactEmergence(rec: ContactEmergenceData, op: 'created' | 'updated' = 'created'): void {
  const syncRec = makeSyncRecord(
    rec.id,
    {
      name: rec.name,
      parentesco: rec.parentesco,
      telefono: rec.telefono ?? null,
    },
    Date.now(),
    Date.now(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export function syncDeleteContactEmergence(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

export async function syncPushContactEmergence() {
  return pushChanges();
}
