import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationTitleInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationTitle {
  public readonly value: string;
  private constructor(value: string) { this.value = value; }

  public static create(value: string): Result<NotificationTitle, NotificationTitleInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new NotificationTitleInvalidError('El título no puede estar vacío'));
    }
    if (value.trim().length > 200) {
      return Result.fail(new NotificationTitleInvalidError('El título no puede exceder 200 caracteres'));
    }
    return Result.ok(new NotificationTitle(value.trim()));
  }
}
