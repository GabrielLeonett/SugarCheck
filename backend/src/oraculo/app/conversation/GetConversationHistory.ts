import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { Conversation } from '../../core/conversation/Conversation';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class GetConversationHistory {
  constructor(private readonly repository: ConversationRepository) {}

  public async run(data: {
    userId: string;
    conversationId: string;
  }): Promise<Result<Conversation, ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const conversationIdRes = ConversationId.create(data.conversationId);
    if (!conversationIdRes.isValid) return Result.fail(conversationIdRes.getError());

    const conversationResult = await this.repository.getById(conversationIdRes.getValue());
    if (!conversationResult.isValid) return conversationResult;

    const conversation = conversationResult.getValue();
    if (!conversation.belongsTo(data.userId)) {
      return Result.fail(new ConversationAccessDeniedError());
    }

    return Result.ok(conversation);
  }
}
