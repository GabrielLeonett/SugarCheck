import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Notification } from '../../../src/notification/core/Notification';

export class StubCreateNotification {
  public calls: {
    userId: string;
    type: string;
    titleKey: string;
    messageKey: string;
    params?: Record<string, string | number>;
    link: string;
  }[] = [];

  async run(data: {
    userId: string;
    type: string;
    titleKey: string;
    messageKey: string;
    params?: Record<string, string | number>;
    link: string;
  }): Promise<Result<Notification, ErrorAbstract>> {
    this.calls.push(data);
    return Result.fail(
      new Error('Stub: notificación no creada') as unknown as ErrorAbstract,
    );
  }
}
