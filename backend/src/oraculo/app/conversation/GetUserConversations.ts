import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { Conversation } from '../../core/conversation/Conversation';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class GetUserConversations {
  constructor(private readonly repository: ConversationRepository) {}

  public async run(data: { userId: string }): Promise<Result<Conversation[], ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    return await this.repository.listByUserId(userIdRes.getValue());
  }
}
