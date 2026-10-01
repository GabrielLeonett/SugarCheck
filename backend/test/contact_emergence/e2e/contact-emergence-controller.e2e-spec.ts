import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { ContactEmergenceController } from '../../../src/contact_emergence/infra/Nest/contact-emergence.controller';
import { PrismaContactEmergenceRepository } from '../../../src/contact_emergence/infra/PrismaContactEmergenceRepository/PrismaContactEmergenceRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { SaveContactEmergence } from '../../../src/contact_emergence/app/SaveContactEmergence';
import { GetAllContactsByUserId } from '../../../src/contact_emergence/app/GetAllContactsByUserId';
import { GetOneContactById } from '../../../src/contact_emergence/app/GetOneContactById';
import { UpdateContactEmergence } from '../../../src/contact_emergence/app/UpdateContactEmergence';
import { DeleteContactEmergence } from '../../../src/contact_emergence/app/DeleteContactEmergence';
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

describe('ContactEmergenceController (E2E)', () => {
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
      controllers: [ContactEmergenceController],
      providers: [
        PrismaService,
        AuthGuard,
        {
          provide: 'ContactEmergenceRepository',
          useClass: PrismaContactEmergenceRepository,
        },
        { provide: 'GenerateUUID', useClass: GenerateUUID },
        {
          provide: 'SaveContactEmergence',
          useFactory: (repo: any, uuid: GenerateUUID) =>
            new SaveContactEmergence(repo, uuid),
          inject: ['ContactEmergenceRepository', 'GenerateUUID'],
        },
        {
          provide: 'GetAllContactsByUserId',
          useFactory: (repo: any) => new GetAllContactsByUserId(repo),
          inject: ['ContactEmergenceRepository'],
        },
        {
          provide: 'GetOneContactById',
          useFactory: (repo: any) => new GetOneContactById(repo),
          inject: ['ContactEmergenceRepository'],
        },
        {
          provide: 'UpdateContactEmergence',
          useFactory: (repo: any) => new UpdateContactEmergence(repo),
          inject: ['ContactEmergenceRepository'],
        },
        {
          provide: 'DeleteContactEmergence',
          useFactory: (repo: any) => new DeleteContactEmergence(repo),
          inject: ['ContactEmergenceRepository'],
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
    const res = await request(app.getHttpServer()).get('/contact-emergence');
    expect(res.status).toBe(401);
  });

  it('POST crea un contacto, GET lo lista y GET /:id lo retorna', async () => {
    const create = await request(app.getHttpServer())
      .post('/contact-emergence')
      .set('Cookie', authCookie(token))
      .send({
        name: 'Mamá E2E',
        parentesco: 'madre',
        telefono: '+57 300 000 0000',
      });

    expect(create.status).toBe(201);
    createdId = create.body.id;

    const list = await request(app.getHttpServer())
      .get('/contact-emergence')
      .set('Cookie', authCookie(token));
    expect(list.status).toBe(200);
    expect(list.body.some((c: any) => c.id === createdId)).toBe(true);

    const one = await request(app.getHttpServer())
      .get(`/contact-emergence/${createdId}`)
      .set('Cookie', authCookie(token));
    expect(one.status).toBe(200);
    expect(one.body.name).toBe('Mamá E2E');
  });

  it('POST con parentesco inválido retorna 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/contact-emergence')
      .set('Cookie', authCookie(token))
      .send({ name: 'Primo', parentesco: 'primo' });
    expect(res.status).toBe(400);
  });

  it('PATCH actualiza el contacto', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/contact-emergence/${createdId}`)
      .set('Cookie', authCookie(token))
      .send({ name: 'Mamá Editada', telefono: '+57 311 111 1111' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Mamá Editada');
  });

  it('DELETE elimina el contacto (204)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/contact-emergence/${createdId}`)
      .set('Cookie', authCookie(token));
    expect(res.status).toBe(204);
  });
});
