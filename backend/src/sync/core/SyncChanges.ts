export const SYNC_TABLES = [
  'glucose',
  'hba1c',
  'insulina',
  'imc',
  'contactEmergence',
  'preference',
] as const;

export type SyncTableName = (typeof SYNC_TABLES)[number];

export function isSyncTable(value: string): value is SyncTableName {
  return (SYNC_TABLES as readonly string[]).includes(value);
}

// Campos de negocio que el cliente puede enviar por tabla (whitelist).
// id / userId / createdAt / updatedAt / deletedAt se manejan aparte.
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
};

export interface TableChanges {
  created?: Record<string, unknown>[];
  updated?: Record<string, unknown>[];
  deleted?: unknown[];
}

export type SyncChangesMap = Partial<Record<SyncTableName, TableChanges>>;

export interface RejectedChange {
  table: string;
  id: string | null;
  reason: string;
}

export interface PushResult {
  applied: number;
  rejected: RejectedChange[];
}

export interface SyncPullTableDelta {
  created: Record<string, unknown>[];
  updated: Record<string, unknown>[];
  deleted: string[];
}

export interface PullResult {
  changes: Record<SyncTableName, SyncPullTableDelta>;
  timestamp: number;
}
