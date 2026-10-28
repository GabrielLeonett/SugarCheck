import { Result } from '../../../../shared/result';
import { ConversationTitleInvalidError } from '../errors/ConversationTitleInvalidError';

const MAX_LENGTH = 120;

export class ConversationTitle {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<ConversationTitle, ConversationTitleInvalidError> {
    const normalized = (value ?? '').trim();
    if (normalized.length === 0) {
      return Result.fail(
        new ConversationTitleInvalidError('El título de la conversación no puede estar vacío').withCode('CONVERSATION_TITLE_EMPTY', 'title'),
      );
    }
    if (normalized.length > MAX_LENGTH) {
      return Result.fail(
        new ConversationTitleInvalidError(`El título no puede superar ${MAX_LENGTH} caracteres`).withCode('CONVERSATION_TITLE_TOO_LONG', 'title'),
      );
    }
    return Result.ok(new ConversationTitle(normalized));
  }

  static get default(): ConversationTitle {
    return new ConversationTitle('Nueva conversación');
  }
}
