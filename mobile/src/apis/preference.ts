import { apiPrivate } from './axios';
import type { Preference } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  getTableDelta,
  getFromSyncAdapter,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'preference';

export const preferenceApi = {
  async getPreferences(): Promise<Preference> {
    const res = await apiPrivate.get('/preference');
    return res.data?.data as Preference;
  },

  async savePreferences(payload: Preference): Promise<Preference> {
    const { userId: _, locale: _l, theme: _t, ...dtoPayload } = payload as any;
    const res = await apiPrivate.post('/preference', dtoPayload);
    return res.data?.data as Preference;
  },
};

export async function syncPullPreference(): Promise<Preference | null> {
  const deltas = await pullChanges();
  const delta = getTableDelta(deltas, TABLE);
  if (!delta) return null;

  const fromSync = getFromSyncAdapter(TABLE) as (rec: Record<string, unknown>) => Preference;

  const created = delta.created ?? [];
  const updated = delta.updated ?? [];
  const latest = created.length > 0 ? created[created.length - 1] : (updated[updated.length - 1] ?? null);
  if (!latest) return null;

  return fromSync(latest) as Preference;
}

export function syncSavePreference(pref: Preference, op: 'created' | 'updated' = 'created'): void {
  const syncRec = makeSyncRecord(
    pref.userId,
    {
      profileImg: pref.profileImg,
      unitMeasure: pref.unitMeasure,
      thresholds: pref.thresholds,
      insulinRatios: pref.insulinRatios,
      sensitivity: pref.sensitivity,
      correctionSchemas: pref.correctionSchemas ?? null,
      basalSchemas: pref.basalSchemas ?? null,
    },
    Date.now(),
    Date.now(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export async function syncPushPreference() {
  return pushChanges();
}
