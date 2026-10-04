import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaSyncRepository } from '../../../src/sync/infra/PrismaSyncRepository/PrismaSyncRepository';
import { SyncWriteOp } from '../../../src/sync/core/SyncRepository';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

const T0 = Date.now() - 60_000;

describe('PrismaSyncRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaSyncRepository;
  let user: TestUser;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      ],
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.onModuleInit();
    repository = new PrismaSyncRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  it('applyWrites upsert crea un registro nuevo con los timestamps del cliente', async () => {
    const op: SyncWriteOp = {
      kind: 'upsert',
      table: 'glucose',
      key: 'g-sync-1',
      userId: user.id,
      data: {
        valueMgdl: 110,
        mealTag: 'En Ayunas',
        date: new Date(),
        time: '08:30',
      },
      createdAt: new Date(T0),
      updatedAt: new Date(T0),
    };

    await repository.applyWrites([op]);

    const row = await (prismaService as any).glucose.findUnique({
      where: { id: 'g-sync-1' },
    });
    expect(row).not.toBeNull();
    expect(row.valueMgdl).toBe(110);
    expect(row.userId).toBe(user.id);
    expect(row.createdAt.getTime()).toBe(T0);
    expect(row.updatedAt.getTime()).toBe(T0);
    expect(row.deletedAt).toBeNull();
  });

  it('applyWrites upsert sobre existente actualiza y revive (deletedAt null)', async () => {
    await repository.applyWrites([
      {
        kind: 'upsert',
        table: 'glucose',
        key: 'g-sync-2',
        userId: user.id,
        data: {
          valueMgdl: 100,
          mealTag: 'En Ayunas',
          date: new Date(),
          time: '08:00',
        },
        createdAt: new Date(T0),
        updatedAt: new Date(T0),
      },
    ]);
    await (prismaService as any).glucose.update({
      where: { id: 'g-sync-2' },
      data: { deletedAt: new Date() },
    });

    await repository.applyWrites([
      {
        kind: 'upsert',
        table: 'glucose',
        key: 'g-sync-2',
        userId: user.id,
        data: {
          valueMgdl: 130,
          mealTag: 'En Ayunas',
          date: new Date(),
          time: '08:10',
        },
        createdAt: new Date(T0),
        updatedAt: new Date(T0 + 5000),
      },
    ]);

    const row = await (prismaService as any).glucose.findUnique({
      where: { id: 'g-sync-2' },
    });
    expect(row.valueMgdl).toBe(130);
    expect(row.deletedAt).toBeNull();
  });

  it('applyWrites softDelete marca deletedAt y updatedAt', async () => {
    await repository.applyWrites([
      {
        kind: 'upsert',
        table: 'glucose',
        key: 'g-sync-3',
        userId: user.id,
        data: {
          valueMgdl: 90,
          mealTag: 'En Ayunas',
          date: new Date(),
          time: '07:30',
        },
        createdAt: new Date(T0),
        updatedAt: new Date(T0),
      },
    ]);

    const deleteAt = T0 + 10000;
    await repository.applyWrites([
      {
        kind: 'softDelete',
        table: 'glucose',
        key: 'g-sync-3',
        updatedAt: new Date(deleteAt),
      },
    ]);

    const row = await (prismaService as any).glucose.findUnique({
      where: { id: 'g-sync-3' },
    });
    expect(row.deletedAt.getTime()).toBe(deleteAt);
    expect(row.updatedAt.getTime()).toBe(deleteAt);
  });

  it('findRowsByIds retorna solo las filas solicitadas y del usuario', async () => {
    const rows = await repository.findRowsByIds('glucose', user.id, [
      'g-sync-1',
      'g-sync-2',
    ]);
    expect(rows.size).toBe(2);
    expect(rows.has('g-sync-1')).toBe(true);

    const none = await repository.findRowsByIds('glucose', user.id, [
      'id-que-no-existe',
    ]);
    expect(none.size).toBe(0);
  });

  it('findModifiedSince sin since retorna todas las filas del usuario', async () => {
    const rows = await repository.findModifiedSince('glucose', user.id, null);
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('findModifiedSince con since filtra por updatedAt y deletedAt', async () => {
    const since = new Date(T0 + 8000);
    // g-sync-2: updatedAt T0+5000 (NO aparece), g-sync-3: deletedAt T0+10000 (aparece)
    const rows = await repository.findModifiedSince('glucose', user.id, since);

    const ids = rows.map((r: any) => r.id);
    expect(ids).toContain('g-sync-3');
    expect(ids).not.toContain('g-sync-2');
  });

  it('preference: applyWrites upsert usa userId como clave', async () => {
    await repository.applyWrites([
      {
        kind: 'upsert',
        table: 'preference',
        key: user.id,
        userId: user.id,
        data: {
          profileImg: '/img/test.png',
          unitMeasure: 'mg/dL',
          thresholds: { hypo: 70, hiper: 180 },
          insulinRatios: { breakfast: 10, lunch: 12, dinner: 15 },
          sensitivity: 30,
        },
        createdAt: new Date(T0),
        updatedAt: new Date(T0),
      },
    ]);

    const rows = await repository.findModifiedSince(
      'preference',
      user.id,
      null,
    );
    expect(rows).toHaveLength(1);
    expect((rows[0] as any).sensitivity).toBe(30);
  });

  it('no mezcla registros entre usuarios', async () => {
    const other = await createTestUser(prismaService as any);
    try {
      await repository.applyWrites([
        {
          kind: 'upsert',
          table: 'glucose',
          key: 'g-other-user',
          userId: other.id,
          data: {
            valueMgdl: 100,
            mealTag: 'En Ayunas',
            date: new Date(),
            time: '08:00',
          },
          createdAt: new Date(T0),
          updatedAt: new Date(T0),
        },
      ]);

      const mine = await repository.findRowsByIds('glucose', user.id, [
        'g-other-user',
      ]);
      expect(mine.size).toBe(0);
    } finally {
      await deleteTestUser(prismaService as any, other.id);
    }
  });
});
