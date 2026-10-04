import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { Message, MessagePlain } from '../../core/conversation/message/Message';
import { MessageId } from '../../core/conversation/message/value-objects/MessageId';
import { MessageContent } from '../../core/conversation/message/value-objects/MessageContent';
import { MessageRole } from '../../core/conversation/message/value-objects/MessageRole';
import { MedicalSafetyPolicy } from '../../core/services/MedicalSafetyPolicy';
import { ORACLE_SYSTEM_PROMPT, buildLanguageModelHistory } from '../../core/services/OraclePrompt';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { GenerateUUIDInterface } from '../../../shared/application/ports/generate-uuid.interface';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { LanguageModel, LanguageModelMessage } from '../ports/LanguageModel';
import { GlucoseDataProvider } from '../ports/GlucoseDataProvider';

const EMPTY_RESPONSE = 'No pude generar una respuesta. Inténtalo de nuevo.';

/** Todo lo necesario para responder, resuelto antes de abrir el stream. */
export interface StreamMessageContext {
  conversationId: string;
  userMessage: MessagePlain;
  systemPrompt: string;
  history: LanguageModelMessage[];
  context?: string;
}

/**
 * Igual que SendMessage pero entrega la respuesta por trozos.
 *
 * Se divide en tres pasos a propósito: `prepare` corre antes de que el
 * controlador escriba los headers, así los rechazos (contenido vacío, consulta
 * fuera del alcance médico, conversación ajena) se responden como errores HTTP
 * normales en lugar de cortarse un stream a medio escribir.
 */
export class StreamMessage {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly generateUUID: GenerateUUIDInterface,
    private readonly languageModel: LanguageModel,
    private readonly glucoseDataProvider: GlucoseDataProvider,
    private readonly safetyPolicy: MedicalSafetyPolicy,
  ) {}

  public async prepare(data: {
    userId: string;
    conversationId: string;
    content: string;
  }): Promise<Result<StreamMessageContext, ErrorAbstract>> {
    const contentRes = MessageContent.create(data.content);
    if (!contentRes.isValid) return Result.fail(contentRes.getError());

    const safetyRes = this.safetyPolicy.evaluate(contentRes.getValue().value);
    if (!safetyRes.isValid) return Result.fail(safetyRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const conversationIdRes = ConversationId.create(data.conversationId);
    if (!conversationIdRes.isValid) return Result.fail(conversationIdRes.getError());

    const conversationResult = await this.repository.getById(conversationIdRes.getValue());
    if (!conversationResult.isValid) return Result.fail(conversationResult.getError());

    const conversation = conversationResult.getValue();
    if (!conversation.belongsTo(data.userId)) {
      return Result.fail(new ConversationAccessDeniedError());
    }

    const userMessageIdRes = MessageId.create(this.generateUUID.run());
    if (!userMessageIdRes.isValid) return Result.fail(userMessageIdRes.getError());

    const userMessage = new Message({
      id: userMessageIdRes.getValue(),
      conversationId: conversation.id.value,
      role: MessageRole.user,
      content: contentRes.getValue(),
      createdAt: new Date(),
    });

    const userSaveRes = await this.repository.addMessage(userMessage);
    if (!userSaveRes.isValid) return Result.fail(userSaveRes.getError());

    const contextResult = await this.glucoseDataProvider.getContext(data.userId);
    const context = contextResult.isValid ? contextResult.getValue() : undefined;

    return Result.ok({
      conversationId: conversation.id.value,
      userMessage: userMessage.toPlain(),
      systemPrompt: ORACLE_SYSTEM_PROMPT,
      history: buildLanguageModelHistory(conversation.messages, contentRes.getValue().value),
      context,
    });
  }

  public run(prepared: StreamMessageContext, signal?: AbortSignal): AsyncIterable<string> {
    return this.languageModel.streamResponse(
      {
        systemPrompt: prepared.systemPrompt,
        messages: prepared.history,
        context: prepared.context,
      },
      signal,
    );
  }

  public async persist(
    prepared: StreamMessageContext,
    text: string,
  ): Promise<Result<MessagePlain, ErrorAbstract>> {
    const contentRes = MessageContent.create(text.trim() || EMPTY_RESPONSE);
    if (!contentRes.isValid) return Result.fail(contentRes.getError());

    const idRes = MessageId.create(this.generateUUID.run());
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const assistantMessage = new Message({
      id: idRes.getValue(),
      conversationId: prepared.conversationId,
      role: MessageRole.assistant,
      content: contentRes.getValue(),
      createdAt: new Date(),
    });

    const saveRes = await this.repository.addMessage(assistantMessage);
    if (!saveRes.isValid) return Result.fail(saveRes.getError());

    return Result.ok(assistantMessage.toPlain());
  }
}