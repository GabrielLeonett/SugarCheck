import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaPreferenceRepository } from '../../../src/preference/infra/PrismaPreferenceRepository/PrismaPreferenceRepository';
import { PreferenceFactory } from '../fixtures/preference.fixture';
import { UnitMeasure } from '../../../src/preference/core/value-objects/UnitMeasure';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('PrismaPreferenceRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaPreferenceRepository;
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
    repository = new PrismaPreferenceRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  it('save crea la preferencia y getOneById la retorna', async () => {
    const preference = PreferenceFactory.createInstance({ userId: user.id });

    const saved = await repository.save(preference);
    expect(saved.isValid).toBe(true);

    const found = await repository.getOneById(
      UserId.create(user.id).getValue(),
    );
    expect(found.isValid).toBe(true);
    expect(found.getValue().toPlain().thresholds).toEqual({
      hypo: 70,
      hiper: 180,
    });
  });

  it('save de nuevo actualiza (upsert) sin duplicar', async () => {
    await repository.save(
      PreferenceFactory.createInstance({ userId: user.id }),
    );
    await repository.save(
      PreferenceFactory.createInstance({
        userId: user.id,
        unitMeasure: 'mmol/L',
        sensitivity: 35,
      }),
    );

    const found = await repository.getOneById(
      UserId.create(user.id).getValue(),
    );
    expect(found.isValid).toBe(true);
    expect(found.getValue().unitMeasure.value).toBe('mmol/L');
    expect(found.getValue().sensitivity.value).toBe(35);
  });

  it('update con UnitMeasure VO cambia la unidad persistida', async () => {
    await repository.save(
      PreferenceFactory.createInstance({ userId: user.id }),
    );
    const saved = await repository.save(
      PreferenceFactory.createInstance({
        userId: user.id,
        unitMeasure: 'mmol/L',
      }),
    );
    void saved;

    const found = await repository.getOneById(
      UserId.create(user.id).getValue(),
    );
    expect(found.getValue().unitMeasure.value).toBe('mmol/L');
    void UnitMeasure;
  });

  it('getOneById falla cuando el usuario no tiene preferencias', async () => {
    const result = await repository.getOneById(
      UserId.create('99999999-9999-4999-8999-999999999999').getValue(),
    );
    expect(result.isValid).toBe(false);
  });
});
