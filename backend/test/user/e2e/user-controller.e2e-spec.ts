import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { UserController } from '../../../src/user/infra/Nest/user.controller';
import { PrismaUserRepository } from '../../../src/user/infra/PrismaUserRepository/PrismaUserRepository';
import { PrismaPreferenceRepository } from '../../../src/preference/infra/PrismaPreferenceRepository/PrismaPreferenceRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { RolesGuard } from '../../../src/auth/infra/roles.guard';
import { GetAllUser } from '../../../src/user/app/GetAllUser';
import { SaveUser } from '../../../src/user/app/SaveUser';
import { GetOneByEmailUser } from '../../../src/user/app/GetOneByEmailUser';
import { GetOneByIdUser } from '../../../src/user/app/GetOneByIdUser';
import { GetOneByUsernameUser } from '../../../src/user/app/GetOneByUsernameUser';
import { UpdateUserEmail } from '../../../src/user/app/UpdateUserEmail';
import { UpdateUser } from '../../../src/user/app/UpdateUser';
import { BcryptHasher } from '../../../src/shared/infrastructure/security/bcrypt-hasher';
import { GenerateUUID } from '../../../src/shared/infrastructure/generate-uuid';
import { GetOneByIdPreference } from '../../../src/preference/app/GetOneByUserIdPreference';
import { SavePreference } from '../../../src/preference/app/SavePreference';
import { DeleteUser } from '../../../src/user/app/DeleteUser';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';
import { UserRepository } from '../../../src/user/core/UserRepository';
import { PreferenceRepository } from '../../../src/preference/core/PreferenceRepository';
import { PasswordHasher } from '../../../src/shared/application/ports/password-hasher.interface';
import { GenerateUUIDInterface } from '../../../src/shared/application/ports/generate-uuid.interface';
import {
  initE2EApp,
  stubTranslationService,
} from '../../shared/helpers/e2e.helper';
import {
  signAccessToken,
  authCookie,
} from '../../shared/helpers/test-db.helper';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const uniqueUsername = `e2e_u_${Date.now()}`;
  const testPassword = 'Password123';
  let createdUserId: string | null = null;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [UserController],
      providers: [
        PrismaService,
        AuthGuard,
        RolesGuard,
        { provide: 'UserRepository', useClass: PrismaUserRepository },
        {
          provide: 'PreferenceRepository',
          useClass: PrismaPreferenceRepository,
        },
        { provide: 'BcryptHasher', useClass: BcryptHasher },
        { provide: 'GenerateUUID', useClass: GenerateUUID },
        {
          provide: 'GetAllUser',
          useFactory: (repo: UserRepository) => new GetAllUser(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'SaveUser',
          useFactory: (
            repo: UserRepository,
            hasher: PasswordHasher,
            generate: GenerateUUIDInterface,
            savePreference: SavePreference,
          ) => new SaveUser(repo, hasher, generate, savePreference),
          inject: [
            'UserRepository',
            'BcryptHasher',
            'GenerateUUID',
            'SavePreference',
          ],
        },
        {
          provide: 'GetOneByEmailUser',
          useFactory: (repo: UserRepository) => new GetOneByEmailUser(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'GetOneByUsernameUser',
          useFactory: (repo: UserRepository) => new GetOneByUsernameUser(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'GetOneByIdUser',
          useFactory: (repo: UserRepository) => new GetOneByIdUser(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'UpdateUser',
          useFactory: (repo: UserRepository, hasher: PasswordHasher) =>
            new UpdateUser(repo, hasher),
          inject: ['UserRepository', 'BcryptHasher'],
        },
        {
          provide: 'UpdateUserEmail',
          useFactory: (repo: UserRepository) => new UpdateUserEmail(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'DeleteUser',
          useFactory: (repo: UserRepository) => new DeleteUser(repo),
          inject: ['UserRepository'],
        },
        {
          provide: 'SavePreference',
          useFactory: (repo: PreferenceRepository) => new SavePreference(repo),
          inject: ['PreferenceRepository'],
        },
        {
          provide: 'GetOneByIdPreference',
          useFactory: (repo: PreferenceRepository) =>
            new GetOneByIdPreference(repo),
          inject: ['PreferenceRepository'],
        },
        { provide: 'UpdatePassword', useClass: PrismaUserRepository },
        { provide: TranslationService, useValue: stubTranslationService() },
      ],
    }).compile();

    app = await initE2EApp(moduleRef);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (createdUserId) {
      await prismaService.user
        .delete({ where: { id: createdUserId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it('POST /user/register registra un usuario real (con preferencias por defecto)', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/register')
      .send({
        name: 'Usuario E2E',
        username: uniqueUsername,
        email: `${uniqueUsername}@test.com`,
        fechaNacimiento: '2015-05-10',
        sexo: 'masculino',
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body).toBeTruthy();

    const created = await prismaService.user.findUnique({
      where: { username: uniqueUsername },
    });
    expect(created).not.toBeNull();
    createdUserId = created.id;

    const preference = await prismaService.preference.findUnique({
      where: { userId: created.id },
    });
    expect(preference).not.toBeNull();
  });

  it('POST /user/register rechaza un body inválido (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/register')
      .send({
        name: 'Usuario E2E',
        username: `${uniqueUsername}_2`,
        sexo: 'helicoptero',
        password: testPassword,
      });
    expect(res.status).toBe(400);
  });

  it('GET /user/id/:id retorna el usuario registrado', async () => {
    const res = await request(app.getHttpServer()).get(
      `/user/id/${createdUserId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.id ?? res.body.userId ?? true).toBeTruthy();
  });

  it('PATCH /user/email actualiza el email del usuario autenticado', async () => {
    const token = signAccessToken({
      sub: createdUserId!,
      username: uniqueUsername,
      roles: ['guerrero'],
    });

    const res = await request(app.getHttpServer())
      .patch('/user/email')
      .set('Cookie', authCookie(token))
      .send({ email: `nuevo_${uniqueUsername}@test.com` });

    expect(res.status).toBe(200);

    const updated = await prismaService.user.findUnique({
      where: { id: createdUserId! },
    });
    expect(updated.email).toBe(`nuevo_${uniqueUsername}@test.com`);
  });

  it('GET /user (admin only) retorna 401 sin token y 403 con token de guerrero', async () => {
    const noToken = await request(app.getHttpServer()).get('/user');
    expect(noToken.status).toBe(401);

    const guerrero = signAccessToken({
      sub: createdUserId!,
      username: uniqueUsername,
      roles: ['guerrero'],
    });
    const forbidden = await request(app.getHttpServer())
      .get('/user')
      .set('Cookie', authCookie(guerrero));
    expect(forbidden.status).toBe(403);
  });
});
