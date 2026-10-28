import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { GlucoseController } from '../../../src/glucose/infra/Nest/glucose.controller';
import { HbA1cController } from '../../../src/glucose/infra/Nest/hba1c.controller';
import { PrismaGlucoseRepository } from '../../../src/glucose/infra/PrismaGlucoseRepository/PrismaGlucoseRepository';
import { PrismaHbA1cRepository } from '../../../src/glucose/infra/PrismaGlucoseRepository/PrismaHbA1cRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { CreateGlucose } from '../../../src/glucose/app/CreateGlucose';
import { GetAllGlucose } from '../../../src/glucose/app/GetAllGlucose';
import { UpdateGlucose } from '../../../src/glucose/app/UpdateGlucose';
import { CreateHbA1c } from '../../../src/glucose/app/CreateHbA1c';
import { GetAllHbA1c } from '../../../src/glucose/app/GetAllHbA1c';
import { UpdateHbA1c } from '../../../src/glucose/app/UpdateHbA1c';
import { GenerateUUID } from '../../../src/shared/infrastructure/generate-uuid';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';
import { Result } from '../../../src/shared/result';
import {
  initE2EApp,
  stubTranslationService,
} from '../../shared/helpers/e2e.helper';
import {
  createTestUser,
  deleteTestUser,
  signAccessToken,
  authCookie,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('GlucoseController + HbA1cController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: TestUser;
  let token: string;

  // Stub configurable: por defecto falla (sin preferencias); se le puede inyectar
  // una preferencia para probar las alertas hipo/hiper.
  const preferenceStub: {
    response: any;
    run: (data: { id: string }) => Promise<any>;
  } = {
    response: null,
    run: async () =>
      preferenceStub.response ??
      Result.fail(new Error('sin preferencia en e2e') as any),
  };
  const notificationStub = { run: async () => Result.ok(undefined as any) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [GlucoseController, HbA1cController],
      providers: [
        PrismaService,
        AuthGuard,
        { provide: 'GlucoseRepository', useClass: PrismaGlucoseRepository },
        { provide: 'HbA1cRepository', useClass: PrismaHbA1cRepository },
        { provide: 'GenerateUUID', useClass: GenerateUUID },
        {
          provide: 'CreateGlucose',
          useFactory: (repo: any) =>
            new CreateGlucose(
              repo,
              new GenerateUUID(),
              preferenceStub as any,
              notificationStub as any,
            ),
          inject: ['GlucoseRepository'],
        },
        {
          provide: 'GetAllGlucose',
          useFactory: (repo: any) => new GetAllGlucose(repo),
          inject: ['GlucoseRepository'],
        },
        {
          provide: 'UpdateGlucose',
          useFactory: (repo: any) => new UpdateGlucose(repo),
          inject: ['GlucoseRepository'],
        },
        {
          provide: 'CreateHbA1c',
          useFactory: (repo: any) => new CreateHbA1c(repo, new GenerateUUID()),
          inject: ['HbA1cRepository'],
        },
        {
          provide: 'GetAllHbA1c',
          useFactory: (repo: any) => new GetAllHbA1c(repo),
          inject: ['HbA1cRepository'],
        },
        {
          provide: 'UpdateHbA1c',
          useFactory: (repo: any) => new UpdateHbA1c(repo),
          inject: ['HbA1cRepository'],
        },
        { provide: TranslationService, useValue: stubTranslationService() },
      ],
    }).compile();

    app = await initE2EApp(moduleRef);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    user = await createTestUser(prismaService as any);
    token = signAccessToken({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await app.close();
  });

  it('401 sin token', async () => {
    const res = await request(app.getHttpServer()).get('/glucose');
    expect(res.status).toBe(401);
  });

  it('POST /glucose crea un registro (201) y GET /glucose lo lista', async () => {
    const create = await request(app.getHttpServer())
      .post('/glucose')
      .set('Cookie', authCookie(token))
      .send({
        valueMgdl: 110,
        mealTag: 'En Ayunas',
        date: new Date().toISOString(),
        time: '08:30',
      });

    expect(create.status).toBe(201);
    expect(create.body.id).toBeTruthy();

    const list = await request(app.getHttpServer())
      .get('/glucose')
      .set('Cookie', authCookie(token));

    expect(list.status).toBe(200);
    expect(list.body.some((g: any) => g.id === create.body.id)).toBe(true);
  });

  it('POST /glucose con body inválido retorna 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/glucose')
      .set('Cookie', authCookie(token))
      .send({
        valueMgdl: 'texto',
        mealTag: 'En Ayunas',
        date: new Date().toISOString(),
        time: '08:30',
      });

    expect(res.status).toBe(400);
  });

  it('POST /glucose con valor bajo la preferencia propaga alert: hipoglucemia', async () => {
    preferenceStub.response = Result.ok({
      toPlain: () => ({
        unitMeasure: 'mg/dL',
        thresholds: { hypo: 70, hiper: 180 },
      }),
    });

    try {
      const create = await request(app.getHttpServer())
        .post('/glucose')
        .set('Cookie', authCookie(token))
        .send({
          valueMgdl: 50,
          mealTag: 'En Ayunas',
          date: new Date().toISOString(),
          time: '08:30',
        });

      expect(create.status).toBe(201);
      expect(create.body.alert).toBe('hipoglucemia');
    } finally {
      preferenceStub.response = null;
    }
  });

  it('PATCH /glucose/:id actualiza el valor', async () => {
    const create = await request(app.getHttpServer())
      .post('/glucose')
      .set('Cookie', authCookie(token))
      .send({
        valueMgdl: 100,
        mealTag: 'En Ayunas',
        date: new Date().toISOString(),
        time: '09:00',
      });

    const patch = await request(app.getHttpServer())
      .patch(`/glucose/${create.body.id}`)
      .set('Cookie', authCookie(token))
      .send({ valueMgdl: 155 });

    expect(patch.status).toBe(200);
    expect(patch.body.valueMgdl).toBe(155);
  });

  it('PATCH /glucose/:id con id inexistente retorna 404', async () => {
    const res = await request(app.getHttpServer())
      .patch('/glucose/99999999-9999-4999-8999-999999999999')
      .set('Cookie', authCookie(token))
      .send({ valueMgdl: 120 });

    expect(res.status).toBe(404);
  });

  it('POST /hba1c crea y PATCH /hba1c/:id actualiza', async () => {
    const create = await request(app.getHttpServer())
      .post('/hba1c')
      .set('Cookie', authCookie(token))
      .send({ valuePercent: 6.5, examDate: new Date().toISOString() });

    expect(create.status).toBe(201);

    const list = await request(app.getHttpServer())
      .get('/hba1c')
      .set('Cookie', authCookie(token));
    expect(list.status).toBe(200);
    expect(list.body.some((h: any) => h.id === create.body.id)).toBe(true);

    const patch = await request(app.getHttpServer())
      .patch(`/hba1c/${create.body.id}`)
      .set('Cookie', authCookie(token))
      .send({ valuePercent: 7.2 });

    expect(patch.status).toBe(200);
    expect(patch.body.valuePercent).toBe(7.2);
  });
});
