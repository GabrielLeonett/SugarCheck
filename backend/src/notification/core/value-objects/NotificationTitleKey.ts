import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationTitleKeyInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationTitleKey {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationTitleKey, NotificationTitleKeyInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationTitleKeyInvalidError('La clave del título no puede estar vacía'));
    }
    return Result.ok(new NotificationTitleKey(value.trim()));
  }
}
