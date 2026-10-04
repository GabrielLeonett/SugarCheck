import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaGlucoseRepository } from '../../../src/glucose/infra/PrismaGlucoseRepository/PrismaGlucoseRepository';
import { PrismaHbA1cRepository } from '../../../src/glucose/infra/PrismaGlucoseRepository/PrismaHbA1cRepository';
import { GlucoseFactory } from '../fixtures/glucose.fixture';
import { HbA1cFactory } from '../fixtures/hba1c.fixture';
import { GlucoseValue } from '../../../src/glucose/core/value-objects/GlucoseValue';
import { HbA1cValue } from '../../../src/glucose/core/value-objects/HbA1cValue';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('PrismaGlucoseRepository + PrismaHbA1cRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaGlucoseRepository;
  let hba1cRepository: PrismaHbA1cRepository;
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

    repository = new PrismaGlucoseRepository(prismaService);
    hba1cRepository = new PrismaHbA1cRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  describe('Glucose', () => {
    it('save + getOneById retorna el registro guardado', async () => {
      const glucose = GlucoseFactory.createInstance({ userId: user.id });

      const saved = await repository.save(glucose);
      expect(saved.isValid).toBe(true);

      const found = await repository.getOneById(glucose.id);
      expect(found.isValid).toBe(true);
      expect(found.getValue().valueMgdl.value).toBe(glucose.valueMgdl.value);
      expect(found.getValue().userId.value).toBe(user.id);
    });

    it('getAllByUserId retorna solo los registros del usuario', async () => {
      const mine = GlucoseFactory.createInstance({ userId: user.id });
      await repository.save(mine);

      const result = await repository.getAllByUserId(mine.userId);
      expect(result.isValid).toBe(true);
      expect(result.getValue().some((g) => g.id.value === mine.id.value)).toBe(
        true,
      );
      result.getValue().forEach((g) => expect(g.userId.value).toBe(user.id));
    });

    it('update cambia el valor de glucosa', async () => {
      const glucose = GlucoseFactory.createInstance({
        userId: user.id,
        valueMgdl: 100,
      });
      await repository.save(glucose);

      const updated = await repository.update(glucose.id, {
        valueMgdl: GlucoseValue.create(150).getValue(),
      });

      expect(updated.isValid).toBe(true);
      expect(updated.getValue().valueMgdl.value).toBe(150);
    });

    it('delete hace soft-delete: ya no aparece en lecturas pero la fila persiste', async () => {
      const glucose = GlucoseFactory.createInstance({ userId: user.id });
      await repository.save(glucose);

      const deleted = await repository.delete(glucose.id);
      expect(deleted.isValid).toBe(true);

      const found = await repository.getOneById(glucose.id);
      expect(found.isValid).toBe(false);

      const all = await repository.getAllByUserId(glucose.userId);
      expect(all.getValue().some((g) => g.id.value === glucose.id.value)).toBe(
        false,
      );

      // La fila sigue en la BD con deletedAt marcado
      const row = await (prismaService as any).glucose.findUnique({
        where: { id: glucose.id.value },
      });
      expect(row).not.toBeNull();
      expect(row.deletedAt).not.toBeNull();
    });
  });

  describe('HbA1c', () => {
    it('save + getOneById + update', async () => {
      const hba1c = HbA1cFactory.createInstance({
        userId: user.id,
        valuePercent: 6.5,
      });
      await hba1cRepository.save(hba1c);

      const found = await hba1cRepository.getOneById(hba1c.id);
      expect(found.isValid).toBe(true);
      expect(found.getValue().valuePercent.value).toBe(6.5);

      const updated = await hba1cRepository.update(hba1c.id, {
        valuePercent: HbA1cValue.create(7.1).getValue(),
      });
      expect(updated.isValid).toBe(true);
      expect(updated.getValue().valuePercent.value).toBe(7.1);
    });

    it('delete hace soft-delete', async () => {
      const hba1c = HbA1cFactory.createInstance({ userId: user.id });
      await hba1cRepository.save(hba1c);

      await hba1cRepository.delete(hba1c.id);

      const found = await hba1cRepository.getOneById(hba1c.id);
      expect(found.isValid).toBe(false);
    });
  });
});
