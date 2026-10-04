import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationMessageKeyInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationMessageKey {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationMessageKey, NotificationMessageKeyInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationMessageKeyInvalidError('La clave del mensaje no puede estar vacía'));
    }
    return Result.ok(new NotificationMessageKey(value.trim()));
  }
}
