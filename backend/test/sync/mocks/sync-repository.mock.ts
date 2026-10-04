import {
  SyncRepository,
  SyncRow,
  SyncWriteOp,
} from '../../../src/sync/core/SyncRepository';
import { SyncTableName } from '../../../src/sync/core/SyncChanges';

export class InMemorySyncRepository implements SyncRepository {
  // table -> key (id o userId para preference) -> row
  public rows = new Map<SyncTableName, Map<string, SyncRow>>();
  public appliedOps: SyncWriteOp[] = [];

  private ensureTable(table: SyncTableName): Map<string, SyncRow> {
    let tableRows = this.rows.get(table);
    if (!tableRows) {
      tableRows = new Map();
      this.rows.set(table, tableRows);
    }
    return tableRows;
  }

  public seed(table: SyncTableName, key: string, row: SyncRow): void {
    this.ensureTable(table).set(key, row);
  }

  public getRow(table: SyncTableName, key: string): SyncRow | undefined {
    return this.rows.get(table)?.get(key);
  }

  async findRowsByIds(
    table: SyncTableName,
    _userId: string,
    ids: string[],
  ): Promise<Map<string, SyncRow>> {
    const tableRows = this.rows.get(table) ?? new Map();
    const result = new Map<string, SyncRow>();
    for (const id of ids) {
      const row = tableRows.get(id);
      if (row) result.set(id, row);
    }
    return result;
  }

  async findModifiedSince(
    table: SyncTableName,
    userId: string,
    _since: Date | null,
  ): Promise<SyncRow[]> {
    const tableRows = this.rows.get(table) ?? new Map();
    return [...tableRows.values()].filter((r: any) => r.userId === userId);
  }

  async applyWrites(ops: SyncWriteOp[]): Promise<void> {
    this.appliedOps.push(...ops);
    for (const op of ops) {
      const tableRows = this.ensureTable(op.table);
      if (op.kind === 'upsert') {
        const existing = tableRows.get(op.key);
        if (existing) {
          tableRows.set(op.key, {
            ...existing,
            ...op.data,
            updatedAt: op.updatedAt,
            deletedAt: null,
          });
        } else {
          tableRows.set(op.key, {
            ...op.data,
            id: op.key,
            userId: op.userId,
            createdAt: op.createdAt,
            updatedAt: op.updatedAt,
          });
        }
      } else {
        const existing = tableRows.get(op.key);
        if (existing) {
          tableRows.set(op.key, {
            ...existing,
            deletedAt: op.updatedAt,
            updatedAt: op.updatedAt,
          });
        }
      }
    }
  }

  public clear(): void {
    this.rows = new Map();
    this.appliedOps = [];
  }
}
