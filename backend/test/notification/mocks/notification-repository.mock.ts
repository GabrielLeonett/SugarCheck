import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Notification } from '../../../src/notification/core/Notification';
import { NotificationRepository } from '../../../src/notification/core/NotificationRepository';
import { NotificationId } from '../../../src/notification/core/value-objects/NotificationId';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { NotificationNotFoundError } from '../../../src/notification/core/errors/NotificationNotFoundError';

export class InMemoryNotificationRepository implements NotificationRepository {
  public items: Notification[] = [];

  async getAllByUserId(
    userId: UserId,
    filter?: 'all' | 'unread',
  ): Promise<Result<Notification[], ErrorAbstract>> {
    let result = this.items.filter((n) => n.userId.value === userId.value);
    if (filter === 'unread') {
      result = result.filter((n) => !n.read);
    }
    return Result.ok(result);
  }

  async getUnreadCountByUserId(
    userId: UserId,
  ): Promise<Result<number, ErrorAbstract>> {
    return Result.ok(
      this.items.filter((n) => n.userId.value === userId.value && !n.read)
        .length,
    );
  }

  async getById(
    id: NotificationId,
  ): Promise<Result<Notification, ErrorAbstract>> {
    const found = this.items.find((n) => n.id.value === id.value);
    if (!found) {
      return Result.fail(
        new NotificationNotFoundError(
          `Notificación con ID ${id.value} no encontrada`,
        ),
      );
    }
    return Result.ok(found);
  }

  async save(
    notification: Notification,
  ): Promise<Result<Notification, ErrorAbstract>> {
    this.items.push(notification);
    return Result.ok(notification);
  }

  async markAsRead(id: NotificationId): Promise<Result<void, ErrorAbstract>> {
    const found = this.items.find((n) => n.id.value === id.value);
    if (!found) {
      return Result.fail(
        new NotificationNotFoundError(
          `Notificación con ID ${id.value} no encontrada`,
        ),
      );
    }
    found.markAsRead();
    return Result.ok(undefined);
  }

  async markAllAsReadByUserId(
    userId: UserId,
  ): Promise<Result<void, ErrorAbstract>> {
    this.items
      .filter((n) => n.userId.value === userId.value)
      .forEach((n) => n.markAsRead());
    return Result.ok(undefined);
  }

  async delete(id: NotificationId): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((n) => n.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new NotificationNotFoundError(
          `Notificación con ID ${id.value} no encontrada`,
        ),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  public clear(): void {
    this.items = [];
  }
}

export class StubNotificationEventEmitter {
  public events: { userId: string; event: string; data: any }[] = [];

  sendToUser(userId: string, event: string, data: any): void {
    this.events.push({ userId, event, data });
  }
}
