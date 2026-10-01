import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class DeleteConversation {
  constructor(private readonly repository: ConversationRepository) {}

  public async run(data: {
    userId: string;
    conversationId: string;
  }): Promise<Result<void, ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const conversationIdRes = ConversationId.create(data.conversationId);
    if (!conversationIdRes.isValid) return Result.fail(conversationIdRes.getError());

    const conversationResult = await this.repository.getById(conversationIdRes.getValue());
    if (!conversationResult.isValid) return Result.fail(conversationResult.getError());

    if (!conversationResult.getValue().belongsTo(data.userId)) {
      return Result.fail(new ConversationAccessDeniedError());
    }

    return await this.repository.delete(conversationIdRes.getValue());
  }
}
