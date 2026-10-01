import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../../../src/auth/infra/auth.guard';
import { NotificationController } from '../../../src/notification/infra/Nest/notification.controller';
import { GetAllNotificationsByUser } from '../../../src/notification/app/GetAllNotificationsByUser';
import { GetUnreadCountByUser } from '../../../src/notification/app/GetUnreadCountByUser';
import { MarkNotificationAsRead } from '../../../src/notification/app/MarkNotificationAsRead';
import { MarkAllNotificationsAsRead } from '../../../src/notification/app/MarkAllNotificationsAsRead';
import {
  InMemoryNotificationRepository,
  StubNotificationEventEmitter,
} from '../mocks/notification-repository.mock';
import { NotificationFactory } from '../fixtures/notification.fixture';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';
import {
  initE2EApp,
  stubTranslationService,
} from '../../shared/helpers/e2e.helper';
import {
  signAccessToken,
  authCookie,
} from '../../shared/helpers/test-db.helper';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('NotificationController (E2E, repositorio en memoria)', () => {
  let app: INestApplication;
  let repository: InMemoryNotificationRepository;
  let token: string;

  beforeAll(async () => {
    repository = new InMemoryNotificationRepository();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [NotificationController],
      providers: [
        AuthGuard,
        { provide: 'NotificationRepository', useValue: repository },
        {
          provide: 'NotificationEventEmitter',
          useValue: new StubNotificationEventEmitter(),
        },
        {
          provide: GetAllNotificationsByUser,
          useFactory: (repo: any) => new GetAllNotificationsByUser(repo),
          inject: ['NotificationRepository'],
        },
        {
          provide: GetUnreadCountByUser,
          useFactory: (repo: any) => new GetUnreadCountByUser(repo),
          inject: ['NotificationRepository'],
        },
        {
          provide: MarkNotificationAsRead,
          useFactory: (repo: any) => new MarkNotificationAsRead(repo),
          inject: ['NotificationRepository'],
        },
        {
          provide: MarkAllNotificationsAsRead,
          useFactory: (repo: any) => new MarkAllNotificationsAsRead(repo),
          inject: ['NotificationRepository'],
        },
        { provide: TranslationService, useValue: stubTranslationService() },
      ],
    }).compile();

    app = await initE2EApp(moduleRef);
    token = signAccessToken({
      sub: USER_ID,
      username: 'testuser',
      roles: ['guerrero'],
    });

    repository.items.push(
      NotificationFactory.createInstance({ userId: USER_ID }),
      NotificationFactory.createInstance({ userId: USER_ID, read: true }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('401 sin token', async () => {
    const res = await request(app.getHttpServer()).get('/notification');
    expect(res.status).toBe(401);
  });

  it('GET /notification lista las notificaciones del usuario', async () => {
    const res = await request(app.getHttpServer())
      .get('/notification')
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('GET /notification?filter=unread filtra las no leídas', async () => {
    const res = await request(app.getHttpServer())
      .get('/notification?filter=unread')
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /notification/unread-count retorna el conteo', async () => {
    const res = await request(app.getHttpServer())
      .get('/notification/unread-count')
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it('PATCH /notification/:id/read marca como leída', async () => {
    const unreadId = repository.items.find((n) => !n.read)!.id.value;

    const res = await request(app.getHttpServer())
      .patch(`/notification/${unreadId}/read`)
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(repository.items.find((n) => n.id.value === unreadId)!.read).toBe(
      true,
    );
  });

  it('PATCH /notification/read-all marca todas como leídas', async () => {
    const res = await request(app.getHttpServer())
      .patch('/notification/read-all')
      .set('Cookie', authCookie(token));

    expect(res.status).toBe(200);
    expect(repository.items.every((n) => n.read)).toBe(true);
  });
});
