import {
  InMemoryNotificationRepository,
  StubNotificationEventEmitter,
} from '../mocks/notification-repository.mock';
import { NotificationFactory } from '../fixtures/notification.fixture';
import { CreateNotification } from '../../../src/notification/app/CreateNotification';
import { GetAllNotificationsByUser } from '../../../src/notification/app/GetAllNotificationsByUser';
import { GetUnreadCountByUser } from '../../../src/notification/app/GetUnreadCountByUser';
import { MarkNotificationAsRead } from '../../../src/notification/app/MarkNotificationAsRead';
import { MarkAllNotificationsAsRead } from '../../../src/notification/app/MarkAllNotificationsAsRead';
import { DeleteNotification } from '../../../src/notification/app/DeleteNotification';

describe('CreateNotification UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let emitter: StubNotificationEventEmitter;
  let useCase: CreateNotification;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    emitter = new StubNotificationEventEmitter();
    useCase = new CreateNotification(repository as any, emitter);
  });

  test('crea una notificación y emite los eventos socket', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      type: 'info',
      titleKey: 'IMC_CREATION_TITLE',
      messageKey: 'IMC_CREATION_MESSAGE',
      params: { value: '27.7' },
      link: '/bitacora/monitoreo-fisico',
    });

    expect(result.isValid).toBe(true);
    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].read).toBe(false);
    expect(emitter.events[0].event).toBe('new_notification');
    expect(emitter.events.some((e) => e.event === 'unread_count')).toBe(true);
  });

  test('rechaza un tipo de notificación inválido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      type: 'desconocido',
      titleKey: 'X',
      messageKey: 'Y',
      link: '/link',
    });

    expect(result.isValid).toBe(false);
    expect(repository.items).toHaveLength(0);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({
      userId: '',
      type: 'info',
      titleKey: 'X',
      messageKey: 'Y',
      link: '/link',
    });
    expect(result.isValid).toBe(false);
  });
});

describe('GetAllNotificationsByUser UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let useCase: GetAllNotificationsByUser;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    useCase = new GetAllNotificationsByUser(repository as any);
  });

  test('retorna las notificaciones del usuario', async () => {
    repository.items.push(
      NotificationFactory.createInstance({ userId: USER_ID }),
      NotificationFactory.createInstance({ userId: USER_ID, read: true }),
    );

    const all = await useCase.run(USER_ID);
    expect(all.isValid).toBe(true);
    expect(all.getValue()).toHaveLength(2);

    const unread = await useCase.run(USER_ID, 'unread');
    expect(unread.getValue()).toHaveLength(1);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run('');
    expect(result.isValid).toBe(false);
  });
});

describe('GetUnreadCountByUser UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let useCase: GetUnreadCountByUser;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    useCase = new GetUnreadCountByUser(repository as any);
  });

  test('cuenta solo las no leídas', async () => {
    repository.items.push(
      NotificationFactory.createInstance({ userId: USER_ID }),
      NotificationFactory.createInstance({ userId: USER_ID }),
      NotificationFactory.createInstance({ userId: USER_ID, read: true }),
    );

    const result = await useCase.run(USER_ID);
    expect(result.isValid).toBe(true);
    expect(result.getValue()).toBe(2);
  });
});

describe('MarkNotificationAsRead UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let useCase: MarkNotificationAsRead;

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    useCase = new MarkNotificationAsRead(repository as any);
  });

  test('marca una notificación como leída', async () => {
    const notification = NotificationFactory.createInstance();
    repository.items.push(notification);

    const result = await useCase.run(notification.id.value);

    expect(result.isValid).toBe(true);
    expect(repository.items[0].read).toBe(true);
  });

  test('falla si la notificación no existe', async () => {
    const result = await useCase.run('no-existe');
    expect(result.isValid).toBe(false);
  });
});

describe('MarkAllNotificationsAsRead UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let useCase: MarkAllNotificationsAsRead;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    useCase = new MarkAllNotificationsAsRead(repository as any);
  });

  test('marca todas las notificaciones del usuario como leídas', async () => {
    repository.items.push(
      NotificationFactory.createInstance({ userId: USER_ID }),
      NotificationFactory.createInstance({ userId: USER_ID }),
    );

    const result = await useCase.run(USER_ID);

    expect(result.isValid).toBe(true);
    expect(repository.items.every((n) => n.read)).toBe(true);
  });
});

describe('DeleteNotification UseCase', () => {
  let repository: InMemoryNotificationRepository;
  let useCase: DeleteNotification;

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    useCase = new DeleteNotification(repository as any);
  });

  test('elimina la notificación', async () => {
    const notification = NotificationFactory.createInstance();
    repository.items.push(notification);

    const result = await useCase.run(notification.id.value);

    expect(result.isValid).toBe(true);
    expect(repository.items).toHaveLength(0);
  });

  test('falla si la notificación no existe', async () => {
    const result = await useCase.run('no-existe');
    expect(result.isValid).toBe(false);
  });
});
