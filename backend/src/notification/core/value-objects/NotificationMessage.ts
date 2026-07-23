import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationMessageInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationMessage {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationMessage, NotificationMessageInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationMessageInvalidError('El mensaje no puede estar vacío'));
    }
    if (value.trim().length > 500) {
      return Result.fail(new NotificationMessageInvalidError('El mensaje no puede exceder 500 caracteres'));
    }
    return Result.ok(new NotificationMessage(value.trim()));
  }
}
