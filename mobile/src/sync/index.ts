export { syncApi } from './sync.api';
export type { SyncChangesPayload, PullResult, PushResult } from './sync.types';
export { useSyncStore } from './sync.store';
export {
  pullChanges,
  pushChanges,
  syncAll,
  addPendingChange,
  makeSyncRecord,
  mapToBackendFields,
  normalizePullDelta,
  getTableDelta,
  type SyncTableName,
  type SyncRecord,
  type TableChanges,
  type TableDelta,
  SYNC_TABLE_FIELDS,
} from './sync.service';
export {
  TO_SYNC_RECORD,
  FROM_SYNC_RECORD,
  type ToSyncRecordFn,
  type FromSyncRecordFn,
  groupPendingChanges,
} from './adapters';
