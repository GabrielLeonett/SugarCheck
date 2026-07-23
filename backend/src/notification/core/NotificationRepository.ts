import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserId } from '../../shared/core/value-objects/UserId';
import { Notification } from './Notification';
import { NotificationId } from './value-objects/NotificationId';

export interface NotificationRepository {
  getAllByUserId(userId: UserId, filter?: 'all' | 'unread'): Promise<Result<Notification[], ErrorAbstract>>;
  getUnreadCountByUserId(userId: UserId): Promise<Result<number, ErrorAbstract>>;
  getById(id: NotificationId): Promise<Result<Notification, ErrorAbstract>>;
  save(notification: Notification): Promise<Result<Notification, ErrorAbstract>>;
  markAsRead(id: NotificationId): Promise<Result<void, ErrorAbstract>>;
  markAllAsReadByUserId(userId: UserId): Promise<Result<void, ErrorAbstract>>;
  delete(id: NotificationId): Promise<Result<void, ErrorAbstract>>;
}
