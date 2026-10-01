import { Result } from '../../../../../shared/result';
import { MessageRoleInvalidError } from '../../errors/MessageRoleInvalidError';

export type MessageRoleType = 'user' | 'assistant' | 'system';

const VALID_ROLES: readonly MessageRoleType[] = ['user', 'assistant', 'system'];

export class MessageRole {
  public readonly value: MessageRoleType;

  private constructor(value: MessageRoleType) {
    this.value = value;
  }

  public static create(value: string): Result<MessageRole, MessageRoleInvalidError> {
    if (!VALID_ROLES.includes(value as MessageRoleType)) {
      return Result.fail(
        new MessageRoleInvalidError(`El rol debe ser: ${VALID_ROLES.join(', ')}`).withCode('INVALID_MESSAGE_ROLE', 'role'),
      );
    }
    return Result.ok(new MessageRole(value as MessageRoleType));
  }

  static get user(): MessageRole {
    return new MessageRole('user');
  }

  static get assistant(): MessageRole {
    return new MessageRole('assistant');
  }
}
