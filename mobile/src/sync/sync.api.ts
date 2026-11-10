/**
 * Capa de red para el protocolo de sincronización del backend.
 * Usa apiPrivate (con token Bearer y refresh automático de 401).
 */
import { apiPrivate } from '@/src/apis/axios';
import type {
  SyncChangesPayload,
  PullResult,
  PushResult,
} from './sync.types';

export const syncApi = {
  /**
   * Envía cambios locales al backend (creados, actualizados, eliminados por tabla).
   */
  async push(payload: SyncChangesPayload): Promise<PushResult> {
    const res = await apiPrivate.post<PushResult>('/sync/push', payload);
    return res.data;
  },

  /**
   * Trae cambios del backend desde una fecha dada (epoch ms).
   */
  async pull(lastPulledAt?: number | null): Promise<PullResult> {
    const query = lastPulledAt != null ? `?lastPulledAt=${lastPulledAt}` : '';
    const res = await apiPrivate.get<PullResult>(`/sync/pull${query}`);
    return res.data;
  },
};
