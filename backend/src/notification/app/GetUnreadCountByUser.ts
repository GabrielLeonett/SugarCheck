import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { UserId } from '../../shared/core/value-objects/UserId';
import type { NotificationRepository } from '../core/NotificationRepository';

@Injectable()
export class GetUnreadCountByUser {
  constructor(
    @Inject('NotificationRepository')
    private readonly repository: NotificationRepository,
  ) {}

  async run(userId: string): Promise<Result<number, ErrorAbstract>> {
    const userIdRes = UserId.create(userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return this.repository.getUnreadCountByUserId(userIdRes.getValue());
  }
}
