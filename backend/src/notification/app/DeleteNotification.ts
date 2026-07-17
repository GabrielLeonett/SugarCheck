import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { NotificationId } from '../core/value-objects/NotificationId';
import type { NotificationRepository } from '../core/NotificationRepository';

@Injectable()
export class DeleteNotification {
  constructor(
    @Inject('NotificationRepository')
    private readonly repository: NotificationRepository,
  ) {}

  async run(notificationId: string): Promise<Result<void, ErrorAbstract>> {
    const idRes = NotificationId.create(notificationId);
    if (!idRes.isValid) return Result.fail(idRes.getError() as ErrorAbstract);

    return this.repository.delete(idRes.getValue());
  }
}
