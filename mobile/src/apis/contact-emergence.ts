import { apiPrivate } from './axios';
import type { ContactEmergenceData } from '../types';
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

const TABLE: SyncTableName = 'contactEmergence';

export const contactEmergenceApi = {
  async getAll(): Promise<ContactEmergenceData[]> {
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      return [{
        id: guest.profile.emergencyContact.id,
        userId: guest.profile.id,
        name: guest.profile.emergencyContact.name,
        parentesco: guest.profile.emergencyContact.relationship,
        telefono: guest.profile.emergencyContact.phone,
      }];
    }

    const response = await apiPrivate.get('/contact-emergence');
    return response.data;
  },

  async create(data: { name: string; parentesco: string; telefono?: string }): Promise<ContactEmergenceData> {
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      const profile = {
        ...guest.profile,
        emergencyContact: {
          id: guest.profile.emergencyContact.id,
          name: data.name,
          relationship: data.parentesco,
          phone: data.telefono ?? '',
        },
      };
      await guest.updateProfile(profile);
      return {
        id: profile.emergencyContact.id,
        userId: profile.id,
        name: data.name,
        parentesco: data.parentesco,
        telefono: data.telefono,
      };
    }

    const response = await apiPrivate.post('/contact-emergence', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; parentesco?: string; telefono?: string }): Promise<ContactEmergenceData> {
    const guest = useGuestStore.getState();
    if (guest.isGuestMode && guest.profile) {
      const profile = {
        ...guest.profile,
        emergencyContact: {
          id: guest.profile.emergencyContact.id,
          name: data.name ?? guest.profile.emergencyContact.name,
          relationship: data.parentesco ?? guest.profile.emergencyContact.relationship,
          phone: data.telefono ?? guest.profile.emergencyContact.phone,
        },
      };
      await guest.updateProfile(profile);
      return {
        id: profile.emergencyContact.id,
        userId: profile.id,
        name: profile.emergencyContact.name,
        parentesco: profile.emergencyContact.relationship,
        telefono: profile.emergencyContact.phone,
      };
    }

    const response = await apiPrivate.patch(`/contact-emergence/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (useGuestStore.getState().isGuestMode) {
      throw new Error('El perfil invitado requiere mantener un contacto de emergencia.');
    }

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
