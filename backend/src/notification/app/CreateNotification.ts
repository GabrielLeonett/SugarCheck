import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserId } from '../../shared/core/value-objects/UserId';
import { Notification } from '../core/Notification';
import { NotificationId } from '../core/value-objects/NotificationId';
import { NotificationType } from '../core/value-objects/NotificationType';
import { NotificationTitle } from '../core/value-objects/NotificationTitle';
import { NotificationMessage } from '../core/value-objects/NotificationMessage';
import { NotificationTitleKey } from '../core/value-objects/NotificationTitleKey';
import { NotificationMessageKey } from '../core/value-objects/NotificationMessageKey';
import { NotificationParams } from '../core/value-objects/NotificationParams';
import { NotificationLink } from '../core/value-objects/NotificationLink';
import type { NotificationRepository } from '../core/NotificationRepository';
import type { NotificationEventEmitter } from './ports/NotificationEventEmitter';

interface CreateNotificationDTO {
  userId: string;
  type: string;
  titleKey: string;
  messageKey: string;
  params?: Record<string, string | number>;
  link: string;
}

@Injectable()
export class CreateNotification {
  constructor(
    @Inject('NotificationRepository')
    private readonly repository: NotificationRepository,
    @Inject('NotificationEventEmitter')
    private readonly emitter: NotificationEventEmitter,
  ) {}

  async run(data: CreateNotificationDTO): Promise<Result<Notification, ErrorAbstract>> {
    const idRes = NotificationId.create(crypto.randomUUID());
    const userIdRes = UserId.create(data.userId);
    const typeRes = NotificationType.create(data.type);
    const titleRes = NotificationTitle.create(data.titleKey);
    const messageRes = NotificationMessage.create(data.messageKey);
    const linkRes = NotificationLink.create(data.link);
    const titleKeyRes = NotificationTitleKey.create(data.titleKey);
    const messageKeyRes = NotificationMessageKey.create(data.messageKey);
    const params = NotificationParams.create(data.params);

    const results = [idRes, userIdRes, typeRes, messageRes, linkRes, titleKeyRes, messageKeyRes] as const;
    for (const r of results) {
      if (!r.isValid) return Result.fail(r.getError() as ErrorAbstract);
    }

    const notification = new Notification({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      type: typeRes.getValue(),
      title: titleRes.getValue(),
      message: messageRes.getValue(),
      titleKey: titleKeyRes.getValue(),
      messageKey: messageKeyRes.getValue(),
      params,
      link: linkRes.getValue(),
      read: false,
      createdAt: new Date(),
    });

    const saveResult = await this.repository.save(notification);
    if (!saveResult.isValid) return saveResult;

    const plain = saveResult.getValue().toPlain();
    this.emitter.sendToUser(data.userId, 'new_notification', plain);

    const countResult = await this.repository.getUnreadCountByUserId(userIdRes.getValue());
    if (countResult.isValid) {
      this.emitter.sendToUser(data.userId, 'unread_count', { count: countResult.getValue() });
    }

    return saveResult;
  }
}
