import { Result } from '../../../../shared/result';
import { ConversationIdInvalidError } from '../errors/ConversationIdInvalidError';

export class ConversationId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<ConversationId, ConversationIdInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new ConversationIdInvalidError('El ID de conversación no puede estar vacío').withCode('CONVERSATION_ID_EMPTY', 'id'),
      );
    }
    return Result.ok(new ConversationId(value.trim()));
  }

  equals(other: ConversationId): boolean {
    return this.value === other.value;
  }
}
