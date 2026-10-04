import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PreferenceController } from '../../../src/preference/infra/Nest/preference.controller';
import { PrismaPreferenceRepository } from '../../../src/preference/infra/PrismaPreferenceRepository/PrismaPreferenceRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { GetOneByIdPreference } from '../../../src/preference/app/GetOneByUserIdPreference';
import { SavePreference } from '../../../src/preference/app/SavePreference';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';
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

describe('PreferenceController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: TestUser;
  let token: string;

  const validBody = {
    profileImg: '/img/avatar.png',
    unitMeasure: 'mg/dL',
    thresholds: { hypo: 70, hiper: 180 },
    insulinRatios: { breakfast: 10, lunch: 12, dinner: 15 },
    sensitivity: 30,
    correctionSchemas: [{ rangeMin: 0, rangeMax: 70, dose: 1 }],
    basalSchemas: [{ injectionTime: '08:30', dose: 5 }],
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [PreferenceController],
      providers: [
        PrismaService,
        AuthGuard,
        {
          provide: 'PreferenceRepository',
          useClass: PrismaPreferenceRepository,
        },
        {
          provide: 'GetOneByIdPreference',
          useFactory: (repo: any) => new GetOneByIdPreference(repo),
          inject: ['PreferenceRepository'],
        },
        {
          provide: 'SavePreference',
          useFactory: (repo: any) => new SavePreference(repo),
          inject: ['PreferenceRepository'],
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
    const res = await request(app.getHttpServer()).get('/preference');
    expect(res.status).toBe(401);
  });

  it('POST /preference guarda las preferencias (201) y GET las retorna', async () => {
    const save = await request(app.getHttpServer())
      .post('/preference')
      .set('Cookie', authCookie(token))
      .send(validBody);

    expect(save.status).toBe(201);

    const get = await request(app.getHttpServer())
      .get('/preference')
      .set('Cookie', authCookie(token));
    expect(get.status).toBe(200);
    expect(get.body.data.thresholds).toEqual({ hypo: 70, hiper: 180 });
    expect(get.body.data.unitMeasure).toBe('mg/dL');
    expect(get.body.data.basalSchemas).toEqual([
      { injectionTime: '08:30', dose: 5 },
    ]);
  });

  it('POST /preference de nuevo actualiza (upsert)', async () => {
    await request(app.getHttpServer())
      .post('/preference')
      .set('Cookie', authCookie(token))
      .send({ ...validBody, unitMeasure: 'mmol/L', sensitivity: 35 });

    const get = await request(app.getHttpServer())
      .get('/preference')
      .set('Cookie', authCookie(token));
    expect(get.status).toBe(200);
    expect(get.body.data.unitMeasure).toBe('mmol/L');
    expect(get.body.data.sensitivity).toBe(35);
  });

  it('POST /preference con thresholds incoherentes retorna 400/500', async () => {
    const res = await request(app.getHttpServer())
      .post('/preference')
      .set('Cookie', authCookie(token))
      .send({ ...validBody, thresholds: { hypo: 200, hiper: 70 } });

    expect([400, 500]).toContain(res.status);
  });
});
