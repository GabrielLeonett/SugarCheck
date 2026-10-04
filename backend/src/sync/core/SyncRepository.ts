import { SyncTableName } from './SyncChanges';

export interface SyncRow {
  [key: string]: unknown;
}

// created/updated viajan con el estado completo del registro (outbox):
// ambos se aplican como upsert; el pull clasifica created vs updated.
export type SyncWriteOp =
  | {
      kind: 'upsert';
      table: SyncTableName;
      key: string;
      userId: string;
      data: Record<string, unknown>;
      createdAt: Date;
      updatedAt: Date;
    }
  | {
      kind: 'softDelete';
      table: SyncTableName;
      key: string;
      updatedAt: Date;
    };

export interface SyncRepository {
  findRowsByIds(
    table: SyncTableName,
    userId: string,
    ids: string[],
  ): Promise<Map<string, SyncRow>>;

  findModifiedSince(
    table: SyncTableName,
    userId: string,
    since: Date | null,
  ): Promise<SyncRow[]>;

  applyWrites(ops: SyncWriteOp[]): Promise<void>;
}
