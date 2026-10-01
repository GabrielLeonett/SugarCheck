import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaImcRepository } from '../../../src/IMC/infra/PrismaImcRepository/PrismaImcRepository';
import { ImcFactory } from '../fixtures/imc.fixture';
import { Peso } from '../../../src/IMC/core/value-objects/peso';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('PrismaImcRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaImcRepository;
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
    repository = new PrismaImcRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  it('save + getOneById retorna el registro con imcValue calculado', async () => {
    const imc = ImcFactory.createInstance({
      userId: user.id,
      peso: 80,
      altura: 170,
    });

    const saved = await repository.save(imc);
    expect(saved.isValid).toBe(true);

    const found = await repository.getOneById(imc.id);
    expect(found.isValid).toBe(true);
    expect(found.getValue().peso.value).toBe(80);
    expect(found.getValue().imcValue).toBeCloseTo(80 / (1.7 * 1.7), 3);
  });

  it('getAllByUserId retorna solo los registros del usuario', async () => {
    const imc = ImcFactory.createInstance({ userId: user.id });
    await repository.save(imc);

    const result = await repository.getAllByUserId(imc.userId);
    expect(result.isValid).toBe(true);
    result.getValue().forEach((i) => expect(i.userId.value).toBe(user.id));
  });

  it('update cambia el peso y recalcula el imcValue persistido', async () => {
    const imc = ImcFactory.createInstance({ userId: user.id, peso: 80 });
    await repository.save(imc);

    const updated = await repository.update(imc.id, {
      peso: Peso.create(76).getValue(),
    });
    expect(updated.isValid).toBe(true);
    expect(updated.getValue().peso.value).toBe(76);
    expect(updated.getValue().imcValue).toBeCloseTo(76 / (1.7 * 1.7), 3);

    // El valor persistido en la BD también queda recalculado
    const row = await (prismaService as any).imc.findUnique({
      where: { id: imc.id.value },
    });
    expect(row.imcValue).toBeCloseTo(76 / (1.7 * 1.7), 3);
  });

  it('delete hace soft-delete y la fila persiste con deletedAt', async () => {
    const imc = ImcFactory.createInstance({ userId: user.id });
    await repository.save(imc);

    await repository.delete(imc.id);

    const found = await repository.getOneById(imc.id);
    expect(found.isValid).toBe(false);

    const row = await (prismaService as any).imc.findUnique({
      where: { id: imc.id.value },
    });
    expect(row.deletedAt).not.toBeNull();
  });
});
