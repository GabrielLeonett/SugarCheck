/**
 * Tipos del protocolo de sincronización del backend.
 * Espejo de `backend/src/sync/core/SyncChanges.ts` y `SyncRepository.ts`.
 *
 * Endpoints del backend:
 *   POST /sync/push   { changes: { [table]: { created, updated, deleted } }, lastPulledAt? }
 *   GET  /sync/pull?lastPulledAt=number  -> { changes: { [table]: { created, updated, deleted } }, timestamp }
 *
 * IMPORTANTE: el backend lee los campos de negocio en la RAÍZ del registro,
 * no dentro de una propiedad `data`. Es decir:
 *   { id, valueMgdl, mealTag, date, time, createdAt, updatedAt }
 */

export type SyncTableName =
  | 'glucose'
  | 'hba1c'
  | 'insulina'
  | 'imc'
  | 'contactEmergence'
  | 'preference';

export interface SyncRecord {
  id: string;
  createdAt: string | number;
  updatedAt: string | number;
  /** Campos de negocio aplanados, tal como los espera el backend. */
  [field: string]: unknown;
}

export interface TableChanges {
  created?: SyncRecord[];
  updated?: SyncRecord[];
  deleted?: string[];
}

export interface SyncChangesPayload {
  changes: Partial<Record<SyncTableName, TableChanges>>;
  lastPulledAt?: number;
}

export interface TableDelta {
  created: Record<string, unknown>[];
  updated: Record<string, unknown>[];
  deleted: string[];
}

export interface PullResult {
  changes: Record<SyncTableName, TableDelta>;
  timestamp: number;
}

export interface PushResult {
  applied: number;
  rejected: { table: string; id: string | null; reason: string }[];
}

/**
 * Mapeo de campos de negocio del móvil al formato del backend para cada tabla.
 * Los campos no listados aquí se ignoran en el push.
 */
export const SYNC_TABLE_FIELDS: Record<SyncTableName, string[]> = {
  glucose: ['valueMgdl', 'mealTag', 'date', 'time'],
  hba1c: ['valuePercent', 'examDate'],
  insulina: ['tipo', 'dosis', 'unidades', 'fecha', 'hora', 'zona', 'contexto'],
  imc: ['peso', 'altura', 'fecha'],
  contactEmergence: ['name', 'parentesco', 'telefono'],
  preference: [
    'profileImg',
    'unitMeasure',
    'thresholds',
    'insulinRatios',
    'sensitivity',
    'correctionSchemas',
    'basalSchemas',
  ],
} as const;
