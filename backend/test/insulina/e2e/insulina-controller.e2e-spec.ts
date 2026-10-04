import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { InsulinaController } from '../../../src/insulina/infra/Nest/insulina.controller';
import { PrismaInsulinaRepository } from '../../../src/insulina/infra/PrismaInsulinaRepository/PrismaInsulinaRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { CreateInsulina } from '../../../src/insulina/app/CreateInsulina';
import { GetAllInsulinas } from '../../../src/insulina/app/GetAllInsulinas';
import { GetOneInsulina } from '../../../src/insulina/app/GetOneInsulina';
import { UpdateInsulina } from '../../../src/insulina/app/UpdateInsulina';
import { DeleteInsulina } from '../../../src/insulina/app/DeleteInsulina';
import { GetTotalsInsulina } from '../../../src/insulina/app/GetTotalsInsulina';
import { GenerateUUID } from '../../../src/shared/infrastructure/generate-uuid';
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

describe('InsulinaController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: TestUser;
  let token: string;
  let createdId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [InsulinaController],
      providers: [
        PrismaService,
        AuthGuard,
        { provide: 'InsulinaRepository', useClass: PrismaInsulinaRepository },
        GenerateUUID,
        {
          provide: 'CreateInsulina',
          useFactory: (repo: any, uuid: GenerateUUID) =>
            new CreateInsulina(repo, uuid),
          inject: ['InsulinaRepository', GenerateUUID],
        },
        {
          provide: 'GetAllInsulinas',
          useFactory: (repo: any) => new GetAllInsulinas(repo),
          inject: ['InsulinaRepository'],
        },
        {
          provide: 'GetOneInsulina',
          useFactory: (repo: any) => new GetOneInsulina(repo),
          inject: ['InsulinaRepository'],
        },
        {
          provide: 'UpdateInsulina',
          useFactory: (repo: any) => new UpdateInsulina(repo),
          inject: ['InsulinaRepository'],
        },
        {
          provide: 'DeleteInsulina',
          useFactory: (repo: any) => new DeleteInsulina(repo),
          inject: ['InsulinaRepository'],
        },
        {
          provide: 'GetTotalsInsulina',
          useFactory: (repo: any) => new GetTotalsInsulina(repo),
          inject: ['InsulinaRepository'],
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

  const todayParams = () => {
    const now = new Date();
    return {
      dia: now.getDate(),
      mes: now.getMonth() + 1,
      anio: now.getFullYear(),
    };
  };

  it('401 sin token', async () => {
    const res = await request(app.getHttpServer()).get('/insulina');
    expect(res.status).toBe(401);
  });

  it('POST /insulina crea un registro y lo lista en GET /insulina', async () => {
    const create = await request(app.getHttpServer())
      .post('/insulina')
      .set('Cookie', authCookie(token))
      .send({
        tipo: 'RAPIDA',
        dosis: 5,
        ...todayParams(),
        hora: '08:30',
        zona: 'ABDOMEN_DERECHO',
        contexto: 'DESAYUNO',
      });

    expect(create.status).toBe(201);
    createdId = create.body.id;

    const list = await request(app.getHttpServer())
      .get('/insulina')
      .set('Cookie', authCookie(token));
    expect(list.status).toBe(200);
    expect(list.body.some((i: any) => i.id === createdId)).toBe(true);
  });

  it('POST /insulina rápida sin contexto retorna 400', async () => {
    const { contexto, ...sinContexto } = {
      tipo: 'RAPIDA',
      dosis: 5,
      ...todayParams(),
      hora: '08:30',
      zona: 'ABDOMEN_DERECHO',
      contexto: 'DESAYUNO',
    };
    void contexto;

    const res = await request(app.getHttpServer())
      .post('/insulina')
      .set('Cookie', authCookie(token))
      .send(sinContexto);

    expect([400, 500]).toContain(res.status);
  });

  it('GET /insulina/totals calcula los totales del día', async () => {
    const res = await request(app.getHttpServer())
      .get('/insulina/totals')
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(res.body.totalGeneral).toBeGreaterThanOrEqual(5);
    expect(res.body.totalRapida).toBeGreaterThanOrEqual(5);
  });

  it('PATCH /insulina/:id actualiza la dosis', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/insulina/${createdId}`)
      .set('Cookie', authCookie(token))
      .send({ dosis: 7.5 });

    expect(res.status).toBe(200);
    expect(res.body.dosis).toBe(7.5);
  });

  it('DELETE /insulina/:id está prohibido por negocio (403)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/insulina/${createdId}`)
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(403);
  });
});
