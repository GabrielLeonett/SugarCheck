import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { SyncController } from '../../../src/sync/infra/Nest/sync.controller';
import { PrismaSyncRepository } from '../../../src/sync/infra/PrismaSyncRepository/PrismaSyncRepository';
import { PushChanges } from '../../../src/sync/app/PushChanges';
import { PullChanges } from '../../../src/sync/app/PullChanges';
import { SyncRepository } from '../../../src/sync/core/SyncRepository';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
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

// Simula el flujo real del móvil: registra offline (UUID generado en el cliente),
// sube cambios pendientes con push y descarga cambios del servidor con pull.
describe('SyncController (E2E roundtrip)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: TestUser;
  let token: string;
  let lastPulledAt = 0;
  let offlinePayloadG2: Record<string, unknown> | null = null;

  const clientGlucose = (id: string, valueMgdl: number) => ({
    id,
    valueMgdl,
    mealTag: 'En Ayunas',
    date: new Date().toISOString(),
    time: '08:30',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [SyncController],
      providers: [
        PrismaService,
        AuthGuard,
        { provide: 'SyncRepository', useClass: PrismaSyncRepository },
        {
          provide: 'PushChanges',
          useFactory: (repo: SyncRepository) => new PushChanges(repo),
          inject: ['SyncRepository'],
        },
        {
          provide: 'PullChanges',
          useFactory: (repo: SyncRepository) => new PullChanges(repo),
          inject: ['SyncRepository'],
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
    const res = await request(app.getHttpServer()).get('/sync/pull');
    expect(res.status).toBe(401);
  });

  it('push sube 2 registros creados offline y pull los devuelve como created', async () => {
    // El outbox del móvil guarda el payload COMPLETO con sus timestamps originales;
    // un reintento reenvía exactamente lo mismo (mismos timestamps).
    offlinePayloadG2 = clientGlucose('client-glucose-2', 95);

    const push = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Cookie', authCookie(token))
      .send({
        changes: {
          glucose: {
            created: [clientGlucose('client-glucose-1', 110), offlinePayloadG2],
          },
        },
      });

    expect(push.status).toBe(200);
    expect(push.body.applied).toBe(2);
    expect(push.body.rejected).toHaveLength(0);

    const pull = await request(app.getHttpServer())
      .get('/sync/pull?lastPulledAt=0')
      .set('Cookie', authCookie(token));

    expect(pull.status).toBe(200);
    expect(pull.body.changes.glucose.created).toHaveLength(2);
    expect(typeof pull.body.timestamp).toBe('number');
    lastPulledAt = pull.body.timestamp;
  });

  it('pull incremental no devuelve lo que ya se descargó', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sync/pull?lastPulledAt=${lastPulledAt}`)
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(res.body.changes.glucose.created).toHaveLength(0);
    expect(res.body.changes.glucose.deleted).toHaveLength(0);
  });

  it('push de un delete se propaga como deleted en el pull incremental', async () => {
    const push = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Cookie', authCookie(token))
      .send({
        changes: {
          glucose: { deleted: ['client-glucose-1'] },
        },
      });

    expect(push.status).toBe(200);
    expect(push.body.applied).toBe(1);

    const pull = await request(app.getHttpServer())
      .get(`/sync/pull?lastPulledAt=${lastPulledAt}`)
      .set('Cookie', authCookie(token));

    expect(pull.status).toBe(200);
    expect(pull.body.changes.glucose.deleted).toContain('client-glucose-1');
    lastPulledAt = pull.body.timestamp;
  });

  it('push repetido es idempotente (no duplica ni reaplica)', async () => {
    // Reenvío exacto del mismo payload (mismos timestamps) → LWW lo salta
    const push = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Cookie', authCookie(token))
      .send({
        changes: {
          glucose: {
            created: [offlinePayloadG2],
          },
        },
      });

    expect(push.status).toBe(200);
    expect(push.body.applied).toBe(0);

    const rows = await (prismaService as any).glucose.findMany({
      where: { userId: user.id },
    });
    expect(rows).toHaveLength(2); // glucose-2 vivo + glucose-1 soft-deleted
  });

  it('push con un registro inválido lo rechaza sin bloquear el lote', async () => {
    const push = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Cookie', authCookie(token))
      .send({
        changes: {
          glucose: {
            created: [
              {
                id: 'client-invalid',
                valueMgdl: 'texto',
                mealTag: 'En Ayunas',
                date: new Date().toISOString(),
                time: '08:30',
              },
              clientGlucose('client-glucose-3', 120),
            ],
          },
        },
      });

    expect(push.status).toBe(200);
    expect(push.body.applied).toBe(1);
    expect(push.body.rejected).toHaveLength(1);
    expect(push.body.rejected[0].id).toBe('client-invalid');
  });

  it('push de insulina con ID del cliente funciona igual', async () => {
    const now = new Date();
    const push = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Cookie', authCookie(token))
      .send({
        changes: {
          insulina: {
            created: [
              {
                id: 'client-insulina-1',
                tipo: 'LENTA',
                dosis: 10,
                fecha: new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                ).toISOString(),
                hora: '22:00',
                zona: 'ABDOMEN_DERECHO',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          },
        },
      });

    expect(push.status).toBe(200);
    expect(push.body.applied).toBe(1);

    const pull = await request(app.getHttpServer())
      .get(`/sync/pull?lastPulledAt=${lastPulledAt}`)
      .set('Cookie', authCookie(token));

    expect(pull.status).toBe(200);
    expect(
      pull.body.changes.insulina.created.some(
        (r: any) => r.id === 'client-insulina-1',
      ),
    ).toBe(true);
  });
});
