import { Result } from '../../../../../shared/result';
import { EmptyMessageError } from '../../errors/EmptyMessageError';

const MAX_LENGTH = 4000;

export class MessageContent {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<MessageContent, EmptyMessageError> {
    const normalized = (value ?? '').trim();
    if (normalized.length === 0) {
      return Result.fail(
        new EmptyMessageError('El mensaje no puede estar vacío').withCode('EMPTY_MESSAGE', 'content'),
      );
    }
    if (normalized.length > MAX_LENGTH) {
      return Result.fail(
        new EmptyMessageError(`El mensaje no puede superar ${MAX_LENGTH} caracteres`).withCode('MESSAGE_TOO_LONG', 'content'),
      );
    }
    return Result.ok(new MessageContent(normalized));
  }
}
