import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaInsulinaRepository } from '../../../src/insulina/infra/PrismaInsulinaRepository/PrismaInsulinaRepository';
import { InsulinaFactory } from '../fixtures/insulina.fixture';
import { Dosis } from '../../../src/insulina/core/value-objects/Dosis';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('PrismaInsulinaRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaInsulinaRepository;
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
    repository = new PrismaInsulinaRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  it('save + getById retorna el registro guardado', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: user.id });

    const saved = await repository.save(insulina);
    expect(saved.isValid).toBe(true);

    const found = await repository.getById(insulina.id);
    expect(found.isValid).toBe(true);
    expect(found.getValue()).not.toBeNull();
    expect(found.getValue()!.dosis.value).toBe(insulina.dosis.value);
  });

  it('getAllByUserId retorna solo los registros del usuario', async () => {
    const mine = InsulinaFactory.createInstance({ userId: user.id });
    await repository.save(mine);

    const result = await repository.getAllByUserId(user.id);
    expect(result.isValid).toBe(true);
    result.getValue().forEach((i) => expect(i.userId).toBe(user.id));
  });

  it('getByUserIdAndDateRange filtra por fechas', async () => {
    const today = InsulinaFactory.createInstance({
      userId: user.id,
      fecha: new Date(),
    });
    const old = InsulinaFactory.createInstance({
      userId: user.id,
      fecha: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    });
    await repository.save(today);
    await repository.save(old);

    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const result = await repository.getByUserIdAndDateRange(
      user.id,
      start,
      end,
    );
    expect(result.isValid).toBe(true);
    expect(result.getValue().some((i) => i.id.value === today.id.value)).toBe(
      true,
    );
    expect(result.getValue().some((i) => i.id.value === old.id.value)).toBe(
      false,
    );
  });

  it('getTotalByUserIdAndDate suma rápidas y lentas del día', async () => {
    const today = new Date();
    await repository.save(
      InsulinaFactory.createInstance({
        userId: user.id,
        dosis: 5,
        fecha: today,
      }),
    );
    await repository.save(
      InsulinaFactory.createInstance({
        userId: user.id,
        dosis: 3,
        fecha: today,
        tipo: 'RAPIDA',
      }),
    );
    await repository.save(
      InsulinaFactory.createInstance({
        userId: user.id,
        dosis: 10,
        fecha: today,
        tipo: 'LENTA',
      }),
    );

    const result = await repository.getTotalByUserIdAndDate(user.id, today);
    expect(result.isValid).toBe(true);
    expect(result.getValue().totalRapida).toBeGreaterThanOrEqual(8);
    expect(result.getValue().totalLenta).toBeGreaterThanOrEqual(10);
  });

  it('update cambia la dosis', async () => {
    const insulina = InsulinaFactory.createInstance({
      userId: user.id,
      dosis: 5,
    });
    await repository.save(insulina);

    const updated = await repository.update(insulina.id, {
      dosis: Dosis.create(7.5).getValue(),
    });

    expect(updated.isValid).toBe(true);
    expect(updated.getValue().dosis.value).toBe(7.5);
  });

  it('delete hace soft-delete: getById retorna null y la fila persiste', async () => {
    const insulina = InsulinaFactory.createInstance({ userId: user.id });
    await repository.save(insulina);

    const deleted = await repository.delete(insulina.id);
    expect(deleted.isValid).toBe(true);

    const found = await repository.getById(insulina.id);
    expect(found.isValid).toBe(true);
    expect(found.getValue()).toBeNull();

    const row = await (prismaService as any).insulina.findUnique({
      where: { id: insulina.id.value },
    });
    expect(row).not.toBeNull();
    expect(row.deletedAt).not.toBeNull();
  });
});
