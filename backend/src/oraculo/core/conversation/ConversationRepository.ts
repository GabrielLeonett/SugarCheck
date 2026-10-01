import { UserId } from '../../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { Conversation } from './Conversation';
import { ConversationId } from './value-objects/ConversationId';
import { Message } from './message/Message';

export interface ConversationRepository {
  save(conversation: Conversation): Promise<Result<Conversation, ErrorAbstract>>;

  getById(id: ConversationId): Promise<Result<Conversation, ErrorAbstract>>;

  listByUserId(userId: UserId): Promise<Result<Conversation[], ErrorAbstract>>;

  addMessage(message: Message): Promise<Result<Message, ErrorAbstract>>;

  delete(id: ConversationId): Promise<Result<void, ErrorAbstract>>;
}
