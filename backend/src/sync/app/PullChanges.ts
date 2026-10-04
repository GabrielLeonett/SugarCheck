import { UserId } from '../../shared/core/value-objects/UserId';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { DatabaseError } from '../../shared/DatabaseError';
import {
  PullResult,
  SYNC_TABLES,
  SyncPullTableDelta,
  SyncTableName,
} from '../core/SyncChanges';
import { SyncRepository, SyncRow } from '../core/SyncRepository';

export class PullChanges {
  constructor(private readonly syncRepository: SyncRepository) {}

  public async run(input: {
    userId: string;
    lastPulledAt: number | null;
  }): Promise<Result<PullResult, ErrorAbstract>> {
    const userIdRes = UserId.create(input.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    // Timestamp capturado ANTES de consultar: garantiza que ningún cambio
    // concurrente quede fuera del próximo pull.
    const timestamp = Date.now();
    const since =
      input.lastPulledAt && input.lastPulledAt > 0
        ? new Date(input.lastPulledAt)
        : null;

    try {
      const changes = {} as Record<SyncTableName, SyncPullTableDelta>;
      for (const table of SYNC_TABLES) {
        const rows = await this.syncRepository.findModifiedSince(
          table,
          userIdRes.getValue().value,
          since,
        );
        changes[table] = this.classifyRows(rows, since);
      }
      return Result.ok({ changes, timestamp });
    } catch (error) {
      console.error('Error en PullChanges:', error);
      return Result.fail(
        new DatabaseError('Error al obtener los cambios de sincronización'),
      );
    }
  }

  private classifyRows(
    rows: SyncRow[],
    since: Date | null,
  ): SyncPullTableDelta {
    const delta: SyncPullTableDelta = { created: [], updated: [], deleted: [] };
    for (const row of rows) {
      const deletedAtMs = this.toMs(row.deletedAt);
      const createdAtMs = this.toMs(row.createdAt) ?? 0;
      const updatedAtMs = this.toMs(row.updatedAt) ?? 0;

      if (deletedAtMs !== undefined) {
        if (since && deletedAtMs > since.getTime()) {
          delta.deleted.push(String(row.id));
        }
        continue;
      }

      if (since === null || createdAtMs > since.getTime()) {
        delta.created.push(this.serializeRow(row));
      } else if (updatedAtMs > since.getTime()) {
        delta.updated.push(this.serializeRow(row));
      }
    }
    return delta;
  }

  // Fechas de negocio -> ISO; createdAt/updatedAt/deletedAt -> epoch ms.
  private serializeRow(row: SyncRow): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt') {
          out[key] = value.getTime();
        } else {
          out[key] = value.toISOString();
        }
      } else {
        out[key] = value;
      }
    }
    if (out.id === undefined && out.userId !== undefined) {
      out.id = out.userId;
    }
    return out;
  }

  private toMs(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const parsed = Date.parse(v);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (v instanceof Date) return v.getTime();
    return undefined;
  }
}
