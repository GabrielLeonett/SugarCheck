import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationIdInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationId {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationId, NotificationIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationIdInvalidError('El ID de notificación no puede estar vacío'));
    }
    return Result.ok(new NotificationId(value.trim()));
  }
}
