/**
 * Tipos del protocolo de sincronización del backend.
 * Espejo de `backend/src/sync/core/SyncChanges.ts` y `SyncRepository.ts`.
 *
 * Endpoints del backend:
 *   POST /sync/push   { changes: { [table]: { created, updated, deleted } }, lastPulledAt? }
 *   GET  /sync/pull?lastPulledAt=number  -> { changes: { [table]: { created, updated, deleted } }, timestamp }
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
  data: Record<string, unknown>;
  createdAt: string | number;
  updatedAt: string | number;
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
