import { Conversation } from '../../core/conversation/Conversation';
import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationTitle } from '../../core/conversation/value-objects/ConversationTitle';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { GenerateUUIDInterface } from '../../../shared/application/ports/generate-uuid.interface';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export class StartConversation {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly generateUUID: GenerateUUIDInterface,
  ) {}

  public async run(data: { userId: string; title?: string }): Promise<Result<Conversation, ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const titleRes = data.title
      ? ConversationTitle.create(data.title)
      : Result.ok(ConversationTitle.default);
    if (!titleRes.isValid) return Result.fail(titleRes.getError());

    const idRes = ConversationId.create(this.generateUUID.run());
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const now = new Date();
    const conversation = new Conversation({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      title: titleRes.getValue(),
      createdAt: now,
      updatedAt: now,
      messages: [],
    });

    return await this.repository.save(conversation);
  }
}
