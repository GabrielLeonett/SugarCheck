import { Result } from '../../../../../shared/result';
import { MessageIdInvalidError } from '../../errors/MessageIdInvalidError';

export class MessageId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<MessageId, MessageIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new MessageIdInvalidError('El ID del mensaje no puede estar vacío').withCode('MESSAGE_ID_EMPTY', 'id'),
      );
    }
    return Result.ok(new MessageId(value.trim()));
  }

  equals(other: MessageId): boolean {
    return this.value === other.value;
  }
}
