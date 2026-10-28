import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import {
  SyncRepository,
  SyncRow,
  SyncWriteOp,
} from '../../core/SyncRepository';
import { SyncTableName } from '../../core/SyncChanges';

@Injectable()
export class PrismaSyncRepository implements SyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  private delegate(client: any, table: SyncTableName): any {
    switch (table) {
      case 'glucose':
        return client.glucose;
      case 'hba1c':
        return client.hbA1c;
      case 'insulina':
        return client.insulina;
      case 'imc':
        return client.imc;
      case 'contactEmergence':
        return client.contactEmergence;
      case 'preference':
        return client.preference;
    }
  }

  async findRowsByIds(
    table: SyncTableName,
    userId: string,
    ids: string[],
  ): Promise<Map<string, SyncRow>> {
    if (ids.length === 0) return new Map();
    const delegate = this.delegate(this.prisma, table);
    const where: any =
      table === 'preference'
        ? { userId: { in: ids } }
        : { userId, id: { in: ids } };
    const rows: SyncRow[] = await delegate.findMany({ where });
    const map = new Map<string, SyncRow>();
    for (const row of rows) {
      const key = table === 'preference' ? String(row.userId) : String(row.id);
      map.set(key, row);
    }
    return map;
  }

  async findModifiedSince(
    table: SyncTableName,
    userId: string,
    since: Date | null,
  ): Promise<SyncRow[]> {
    const delegate = this.delegate(this.prisma, table);
    const where: any = { userId };
    if (since) {
      where.OR = [{ updatedAt: { gt: since } }, { deletedAt: { gt: since } }];
    }
    return (await delegate.findMany({ where })) as SyncRow[];
  }

  async applyWrites(ops: SyncWriteOp[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const op of ops) {
        const delegate = this.delegate(tx, op.table);
        if (op.kind === 'upsert') {
          if (op.table === 'preference') {
            await delegate.upsert({
              where: { userId: op.userId },
              create: {
                ...op.data,
                userId: op.userId,
                createdAt: op.createdAt,
                updatedAt: op.updatedAt,
              },
              update: {
                ...op.data,
                updatedAt: op.updatedAt,
                deletedAt: null,
              },
            });
          } else {
            await delegate.upsert({
              where: { id: op.key },
              create: {
                ...op.data,
                id: op.key,
                userId: op.userId,
                createdAt: op.createdAt,
                updatedAt: op.updatedAt,
              },
              update: {
                ...op.data,
                updatedAt: op.updatedAt,
                deletedAt: null,
              },
            });
          }
        } else {
          if (op.table === 'preference') continue; // no soportado
          await delegate.update({
            where: { id: op.key },
            data: { deletedAt: op.updatedAt, updatedAt: op.updatedAt },
          });
        }
      }
    });
  }
}
