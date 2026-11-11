import { apiPrivate } from './axios';
import type { GlucoseRecord } from '../types';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  getTableDelta,
  FROM_SYNC_RECORD,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'glucose';

export interface GlucoseBackendRecord {
  id: string;
  userId: string;
  valueMgdl: number;
  mealTag: string;
  date: string;
  time: string;
  createdAt: string;
  alert: string | null;
}

export interface GlucoseEntry extends GlucoseRecord {
  timestamp: Date;
}

function formatFecha(dateISO: string): string {
  const date = new Date(dateISO);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function formatHora(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function mapRecord(item: GlucoseBackendRecord): GlucoseEntry {
  const datePart = item.date.slice(0, 10);
  return {
    id: item.id,
    nivel: item.valueMgdl,
    contexto: item.mealTag,
    fecha: formatFecha(item.date),
    hora: formatHora(item.time),
    timestamp: new Date(`${datePart}T${item.time}:00`),
  };
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  ENDPOINTS INDIVIDUALES (mantener compatibilidad)                           */
/*─────────────────────────────────────────────────────────────────────────────*/

export const glucoseApi = {
  async getAll(): Promise<GlucoseEntry[]> {
    const res = await apiPrivate.get('/glucose');
    const data = res.data as GlucoseBackendRecord[];
    return data
      .map(mapRecord)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  async create(dto: {
    valueMgdl: number;
    mealTag: string;
    date: string;
    time: string;
  }): Promise<GlucoseEntry> {
    const res = await apiPrivate.post('/glucose', dto);
    return mapRecord(res.data as GlucoseBackendRecord);
  },
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*  PROTOCOLO DE SINCRONIZACIÓN (/sync/push + /sync/pull)                      */
/*─────────────────────────────────────────────────────────────────────────────*/

/**
 * Trae cambios de glucosa desde el servidor vía /sync/pull.
 */
export async function syncPullGlucose(): Promise<GlucoseEntry[]> {
  const deltas = await pullChanges();
  const delta = getTableDelta(deltas, TABLE);
  if (!delta) return [];

  const fromSync = FROM_SYNC_RECORD[TABLE] as (rec: Record<string, unknown>) => GlucoseEntry;

  const created = (delta.created ?? [])
    .map(fromSync)
    .sort((a: GlucoseEntry, b: GlucoseEntry) => b.timestamp.getTime() - a.timestamp.getTime());

  const updated = (delta.updated ?? [])
    .map(fromSync)
    .sort((a: GlucoseEntry, b: GlucoseEntry) => b.timestamp.getTime() - a.timestamp.getTime());

  const deletedIds = new Set(delta.deleted ?? []);
  const all = [...created, ...updated].filter((e) => !deletedIds.has(e.id));
  return all.sort((a: GlucoseEntry, b: GlucoseEntry) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Registra un cambio local de glucosa para subirlo en el próximo push.
 */
export function syncSaveGlucose(entry: GlucoseEntry, op: 'created' | 'updated' = 'created'): void {
  const syncRec = makeSyncRecord(
    entry.id,
    {
      valueMgdl: entry.nivel,
      mealTag: entry.contexto,
      date: entry.fecha,
      time: entry.hora,
    },
    entry.timestamp.getTime(),
    entry.timestamp.getTime(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

/**
 * Marca una glucosa como eliminada para subirlo en el próximo push.
 */
export function syncDeleteGlucose(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

/**
 * Sube los cambios pendientes al servidor.
 */
export async function syncPushGlucose() {
  return pushChanges();
}
