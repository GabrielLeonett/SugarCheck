import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

const VALID_TYPES = ['alert', 'reminder', 'achievement', 'info', 'warning'] as const;
export type NotificationTypeValue = typeof VALID_TYPES[number];

export class NotificationTypeInvalidError extends ErrorAbstract {
  constructor(message: string) { super(message); }
}

export class NotificationType {
  public readonly value: NotificationTypeValue;
  private constructor(value: NotificationTypeValue) { this.value = value; }

  public static create(value: string): Result<NotificationType, NotificationTypeInvalidError> {
    if (!VALID_TYPES.includes(value as NotificationTypeValue)) {
      return Result.fail(new NotificationTypeInvalidError(
        `Tipo de notificación inválido. Debe ser: ${VALID_TYPES.join(', ')}`
      ));
    }
    return Result.ok(new NotificationType(value as NotificationTypeValue));
  }
}
