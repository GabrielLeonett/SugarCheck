import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationLinkInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationLink {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationLink, NotificationLinkInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationLinkInvalidError('El link no puede estar vacío'));
    }
    return Result.ok(new NotificationLink(value.trim()));
  }
}
