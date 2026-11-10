/**
 * Servicio de sincronización. Orquesta push/pull contra el backend
 * usando el protocolo de `/sync/push` y `/sync/pull`.
 *
 * Flujo típico:
 *  1. pull() al iniciar sesión para obtener cambios del servidor y actualizar lastPulledAt.
 *  2. Las acciones locales (guardar glucosa, insulina, etc.) acumulan cambios en pendingChanges.
 *  3. push() envía los cambios acumulados y actualiza lastPulledAt con el timestamp de respuesta.
 */
import { syncApi } from './sync.api';
import { useSyncStore } from './sync.store';
import type {
  SyncTableName,
  SyncRecord,
  TableChanges,
  TableDelta,
  PullResult,
} from './sync.types';

export type { SyncTableName, SyncRecord, TableChanges, TableDelta };
export { SYNC_TABLE_FIELDS } from './sync.types';

const EMPTY_DELTA: TableDelta = { created: [], updated: [], deleted: [] };

/**
 * Realiza pull de cambios desde el servidor y devuelve los deltas por tabla.
 * Actualiza lastPulledAt con el timestamp del servidor.
 */
export async function pullChanges(): Promise<
  Partial<Record<SyncTableName, TableDelta>>
> {
  const { lastPulledAt } = useSyncStore.getState();

  useSyncStore.getState().setSyncing(true);
  try {
    const result: PullResult = await syncApi.pull(lastPulledAt ?? undefined);
    useSyncStore.getState().setLastPulledAt(result.timestamp);
    return result.changes;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || 'Error al sincronizar';
    useSyncStore.getState().setLastError(msg);
    throw error;
  } finally {
    useSyncStore.getState().setSyncing(false);
  }
}

/**
 * Envía los cambios acumulados localmente al servidor.
 * Después de un push exitoso, limpia los cambios enviados y actualiza lastPulledAt
 * si el servidor devolvió cambios (pull combinado).
 */
export async function pushChanges(): Promise<{
  applied: number;
  rejected: Array<{ table: string; id: string | null; reason: string }>;
}> {
  const { pendingChanges, lastPulledAt } = useSyncStore.getState();

  if (
    Object.keys(pendingChanges).length === 0 &&
    !Object.values(pendingChanges).some(
      (tc) =>
        (tc.created?.length ?? 0) > 0 ||
        (tc.updated?.length ?? 0) > 0 ||
        (tc.deleted?.length ?? 0) > 0
    )
  ) {
    return { applied: 0, rejected: [] };
  }

  useSyncStore.getState().setSyncing(true);
  try {
    const payload = useSyncStore.getState().buildPayload();
    payload.lastPulledAt = lastPulledAt ?? undefined;
    const res = await syncApi.push(payload);

    // Limpiar cambios enviados
    useSyncStore.getState().clearPendingChanges();

    // Actualizamos lastPulledAt con ahora para evitar re-enviar.
    const now = Date.now();
    useSyncStore.getState().setLastPulledAt(now);

    return { applied: res.applied, rejected: res.rejected };
  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error?.message || 'Error al subir cambios';
    useSyncStore.getState().setLastError(msg);
    throw error;
  } finally {
    useSyncStore.getState().setSyncing(false);
  }
}

/**
 * Sincronización completa: pull primero, luego push.
 */
export async function syncAll(): Promise<{
  pulled: Partial<Record<SyncTableName, TableDelta>>;
  pushed: { applied: number; rejected: Array<{ table: string; id: string | null; reason: string }> };
}> {
  const pulled = await pullChanges();
  const pushed = await pushChanges();
  return { pulled, pushed };
}

/**
 * Registra un cambio local pendiente para ser subido en el próximo push.
 */
export function addPendingChange(
  table: SyncTableName,
  change: TableChanges,
): void {
  useSyncStore.getState().addPendingChange(table, change);
}

/**
 * Crea un SyncRecord genérico para usar en created/updated.
 */
export function makeSyncRecord(
  id: string,
  data: Record<string, unknown>,
  createdAt?: string | number,
  updatedAt?: string | number,
): SyncRecord {
  const now = Date.now();
  return {
    id,
    data,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
  };
}

/**
 * Mapea un objeto de negocio del móvil al formato de campo esperado por el backend
 * para una tabla dada, filtrando solo los campos permitidos.
 */
export function mapToBackendFields(table: SyncTableName, data: Record<string, unknown>): Record<string, unknown> {
  // Los campos se envían tal cual; el backend valida y aplica los whitelists.
  // Esta función es un punto de extensión para transformaciones específicas del móvil.
  return data;
}

/**
 * Convierte un TableDelta del servidor (created/updated con objetos planos, deleted con IDs)
 * en un formato usable por el móvil. Por defecto devuelve el delta tal cual.
 */
export function normalizePullDelta(table: SyncTableName, delta: TableDelta): TableDelta {
  return {
    created: delta.created ?? [],
    updated: delta.updated ?? [],
    deleted: delta.deleted ?? [],
  };
}

/**
 * Accede de forma segura al delta de una tabla específica desde el resultado de pull.
 */
export function getTableDelta(
  deltas: Partial<Record<SyncTableName, TableDelta>>,
  table: SyncTableName,
): TableDelta | undefined {
  return deltas[table];
}
