import { apiPrivate } from './axios';
import type { Preference } from '../types';
import { useGuestStore } from '@/src/stores/guestStore';
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
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      return {
        userId: guest.profile.id,
        profileImg: guest.profile.avatar,
        unitMeasure: 'mg/dL',
        thresholds: {
          hypo: guest.profile.glucoseRange.hypo,
          hiper: guest.profile.glucoseRange.hyper,
        },
        locale: 'es',
        theme: 'light',
      };
    }

    const res = await apiPrivate.get('/preference');
    return res.data?.data as Preference;
  },

  async savePreferences(payload: Preference): Promise<Preference> {
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      const profile = {
        ...guest.profile,
        avatar: payload.profileImg,
        glucoseRange: {
          hypo: payload.thresholds.hypo,
          hyper: payload.thresholds.hiper,
        },
      };
      await guest.updateProfile(profile);
      return {
        ...payload,
        userId: profile.id,
        profileImg: profile.avatar,
        thresholds: { hypo: profile.glucoseRange.hypo, hiper: profile.glucoseRange.hyper },
      };
    }

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
