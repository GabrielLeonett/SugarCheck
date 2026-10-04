import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { ImcController } from '../../../src/IMC/infra/Nest/imc.controller';
import { PrismaImcRepository } from '../../../src/IMC/infra/PrismaImcRepository/PrismaImcRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { CreateImc } from '../../../src/IMC/app/CreateImc';
import { GetAllImcByUserId } from '../../../src/IMC/app/GetAllImcByUserId';
import { GetOneImcById } from '../../../src/IMC/app/GetOneImcById';
import { UpdateImc } from '../../../src/IMC/app/UpdateImc';
import { DeleteImc } from '../../../src/IMC/app/DeleteImc';
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

describe('ImcController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: TestUser;
  let token: string;
  let createdId: string;

  const notificationStub = { run: async () => Result.ok(undefined as any) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [ImcController],
      providers: [
        PrismaService,
        AuthGuard,
        { provide: 'ImcRepository', useClass: PrismaImcRepository },
        { provide: 'GenerateUUID', useClass: GenerateUUID },
        {
          provide: 'CreateImc',
          useFactory: (repo: any, uuid: GenerateUUID) =>
            new CreateImc(repo, uuid, notificationStub as any),
          inject: ['ImcRepository', 'GenerateUUID'],
        },
        {
          provide: 'GetAllImcByUserId',
          useFactory: (repo: any) => new GetAllImcByUserId(repo),
          inject: ['ImcRepository'],
        },
        {
          provide: 'GetOneImcById',
          useFactory: (repo: any) => new GetOneImcById(repo),
          inject: ['ImcRepository'],
        },
        {
          provide: 'UpdateImc',
          useFactory: (repo: any) => new UpdateImc(repo),
          inject: ['ImcRepository'],
        },
        {
          provide: 'DeleteImc',
          useFactory: (repo: any) => new DeleteImc(repo),
          inject: ['ImcRepository'],
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
    const res = await request(app.getHttpServer()).get('/imc');
    expect(res.status).toBe(401);
  });

  it('POST /imc crea un registro con imcValue calculado', async () => {
    const create = await request(app.getHttpServer())
      .post('/imc')
      .set('Cookie', authCookie(token))
      .send({ peso: 80, altura: 170, ...todayParams() });

    expect(create.status).toBe(201);
    expect(create.body.imcValue).toBeCloseTo(80 / (1.7 * 1.7), 2);
    createdId = create.body.id;
  });

  it('GET /imc lista los registros del usuario', async () => {
    const res = await request(app.getHttpServer())
      .get('/imc')
      .set('Cookie', authCookie(token));
    expect(res.status).toBe(200);
    expect(res.body.some((i: any) => i.id === createdId)).toBe(true);
  });

  it('GET /imc/:id retorna el registro', async () => {
    const res = await request(app.getHttpServer())
      .get(`/imc/${createdId}`)
      .set('Cookie', authCookie(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('PATCH /imc/:id actualiza el peso', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/imc/${createdId}`)
      .set('Cookie', authCookie(token))
      .send({ peso: 78 });

    expect(res.status).toBe(200);
    expect(res.body.peso).toBe(78);
  });

  it('DELETE /imc/:id elimina el registro (204)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/imc/${createdId}`)
      .set('Cookie', authCookie(token));
    expect(res.status).toBe(204);
  });
});
