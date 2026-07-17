import { Injectable } from '@nestjs/common';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { FirestoreService } from '../../../shared/infrastructure/firestore.service';
import { NotificationRepository } from '../../core/NotificationRepository';
import { Notification, NotificationPlain } from '../../core/Notification';
import { NotificationId } from '../../core/value-objects/NotificationId';
import { NotificationType } from '../../core/value-objects/NotificationType';
import { NotificationTitle } from '../../core/value-objects/NotificationTitle';
import { NotificationMessage } from '../../core/value-objects/NotificationMessage';
import { NotificationLink } from '../../core/value-objects/NotificationLink';
import { NotificationNotFoundError } from '../../core/errors/NotificationNotFoundError';

const COLLECTION = 'notifications';

@Injectable()
export class FirestoreNotificationRepository implements NotificationRepository {
  constructor(private readonly firestore: FirestoreService) {}

  private toDomain(raw: FirebaseFirestore.DocumentData): Notification {
    return new Notification({
      id: NotificationId.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      type: NotificationType.create(raw.type).getValue(),
      title: NotificationTitle.create(raw.title).getValue(),
      message: NotificationMessage.create(raw.message).getValue(),
      link: NotificationLink.create(raw.link).getValue(),
      read: raw.read ?? false,
      createdAt: raw.createdAt?.toDate?.() ?? new Date(raw.createdAt),
    });
  }

  private toPersistence(notification: Notification): Record<string, unknown> {
    return {
      userId: notification.userId.value,
      type: notification.type.value,
      title: notification.title.value,
      message: notification.message.value,
      link: notification.link.value,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }

  async getAllByUserId(userId: UserId, filter?: 'all' | 'unread'): Promise<Result<Notification[], ErrorAbstract>> {
    try {
      let query: FirebaseFirestore.Query = this.firestore.db
        .collection(COLLECTION)
        .where('userId', '==', userId.value)
        .orderBy('createdAt', 'desc');

      if (filter === 'unread') {
        query = query.where('read', '==', false);
      }

      const snapshot = await query.get();
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return this.toDomain({ id: doc.id, ...data });
      });

      return Result.ok(notifications);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al obtener notificaciones', error instanceof Error ? error.stack : undefined));
    }
  }

  async getUnreadCountByUserId(userId: UserId): Promise<Result<number, ErrorAbstract>> {
    try {
      const snapshot = await this.firestore.db
        .collection(COLLECTION)
        .where('userId', '==', userId.value)
        .where('read', '==', false)
        .get();

      return Result.ok(snapshot.size);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al contar notificaciones', error instanceof Error ? error.stack : undefined));
    }
  }

  async getById(id: NotificationId): Promise<Result<Notification, ErrorAbstract>> {
    try {
      const doc = await this.firestore.db.collection(COLLECTION).doc(id.value).get();
      if (!doc.exists) {
        return Result.fail(new NotificationNotFoundError());
      }
      return Result.ok(this.toDomain({ id: doc.id, ...doc.data() }));
    } catch (error) {
      return Result.fail(new DatabaseError('Error al obtener notificación', error instanceof Error ? error.stack : undefined));
    }
  }

  async save(notification: Notification): Promise<Result<Notification, ErrorAbstract>> {
    try {
      await this.firestore.db
        .collection(COLLECTION)
        .doc(notification.id.value)
        .set(this.toPersistence(notification));

      return Result.ok(notification);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al guardar notificación', error instanceof Error ? error.stack : undefined));
    }
  }

  async markAsRead(id: NotificationId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.firestore.db
        .collection(COLLECTION)
        .doc(id.value)
        .update({ read: true });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al marcar notificación como leída', error instanceof Error ? error.stack : undefined));
    }
  }

  async markAllAsReadByUserId(userId: UserId): Promise<Result<void, ErrorAbstract>> {
    try {
      const snapshot = await this.firestore.db
        .collection(COLLECTION)
        .where('userId', '==', userId.value)
        .where('read', '==', false)
        .get();

      const batch = this.firestore.db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al marcar todas como leídas', error instanceof Error ? error.stack : undefined));
    }
  }

  async delete(id: NotificationId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.firestore.db.collection(COLLECTION).doc(id.value).delete();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DatabaseError('Error al eliminar notificación', error instanceof Error ? error.stack : undefined));
    }
  }
}
