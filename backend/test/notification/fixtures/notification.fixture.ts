import { faker } from '@faker-js/faker';
import { Notification } from '../../../src/notification/core/Notification';
import { NotificationId } from '../../../src/notification/core/value-objects/NotificationId';
import { NotificationType } from '../../../src/notification/core/value-objects/NotificationType';
import { NotificationTitle } from '../../../src/notification/core/value-objects/NotificationTitle';
import { NotificationMessage } from '../../../src/notification/core/value-objects/NotificationMessage';
import { NotificationLink } from '../../../src/notification/core/value-objects/NotificationLink';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

export const VALID_TYPES = [
  'alert',
  'reminder',
  'achievement',
  'info',
  'warning',
] as const;

interface NotificationOverrides {
  id?: string;
  userId?: string;
  type?: string;
  title?: string;
  message?: string;
  link?: string;
  read?: boolean;
}

export class NotificationFactory {
  static createInstance(overrides: NotificationOverrides = {}): Notification {
    return new Notification({
      id: NotificationId.create(overrides.id ?? faker.string.uuid()).getValue(),
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      type: NotificationType.create(overrides.type ?? 'info').getValue(),
      title: NotificationTitle.create(
        overrides.title ?? 'Notificación de prueba',
      ).getValue(),
      message: NotificationMessage.create(
        overrides.message ?? 'Mensaje de prueba de la notificación',
      ).getValue(),
      link: NotificationLink.create(overrides.link ?? '/bitacora').getValue(),
      read: overrides.read ?? false,
      createdAt: new Date(),
    });
  }
}
