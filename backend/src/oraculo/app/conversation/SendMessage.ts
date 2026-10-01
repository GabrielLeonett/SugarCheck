import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { Message, MessagePlain } from '../../core/conversation/message/Message';
import { MessageId } from '../../core/conversation/message/value-objects/MessageId';
import { MessageContent } from '../../core/conversation/message/value-objects/MessageContent';
import { MessageRole } from '../../core/conversation/message/value-objects/MessageRole';
import { MedicalSafetyPolicy } from '../../core/services/MedicalSafetyPolicy';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { GenerateUUIDInterface } from '../../../shared/application/ports/generate-uuid.interface';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { LanguageModel, LanguageModelMessage, LanguageModelRole } from '../ports/LanguageModel';
import { GlucoseDataProvider } from '../ports/GlucoseDataProvider';

const SYSTEM_PROMPT = [
  'Eres Gluco, también llamado "Oráculo Azul", un asistente virtual de apoyo para personas que viven con diabetes.',
  'Tu objetivo es acompañar, motivar y ayudar a interpretar tendencias generales de glucosa, hábitos y bienestar.',
  'Responde en español, de forma breve, cálida y clara (máximo 3 párrafos cortos).',
  'NUNCA des consejos sobre dosis de insulina, ajustes de medicamentos ni tratamientos médicos. Ante esas dudas, recomienda consultar a un profesional de salud.',
  'Si te proporcionan contexto de glucosa, úsalo para dar una interpretación general, sin alarmar.',
].join(' ');

export interface SendMessageResult {
  conversationId: string;
  userMessage: MessagePlain;
  assistantMessage: MessagePlain;
}

export class SendMessage {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly generateUUID: GenerateUUIDInterface,
    private readonly languageModel: LanguageModel,
    private readonly glucoseDataProvider: GlucoseDataProvider,
    private readonly safetyPolicy: MedicalSafetyPolicy,
  ) {}

  public async run(data: {
    userId: string;
    conversationId: string;
    content: string;
  }): Promise<Result<SendMessageResult, ErrorAbstract>> {
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

    const history: LanguageModelMessage[] = conversation.messages.map((m) => ({
      role: m.role.value as LanguageModelRole,
      content: m.content.value,
    }));
    history.push({ role: 'user', content: contentRes.getValue().value });

    let context: string | undefined;
    const contextResult = await this.glucoseDataProvider.getContext(data.userId);
    if (contextResult.isValid) {
      context = contextResult.getValue();
    }

    const generationResult = await this.languageModel.generateResponse({
      systemPrompt: SYSTEM_PROMPT,
      messages: history,
      context,
    });
    if (!generationResult.isValid) return Result.fail(generationResult.getError());

    const assistantContent = generationResult.getValue().trim();
    const assistantContentRes = MessageContent.create(assistantContent || 'No pude generar una respuesta. Inténtalo de nuevo.');
    if (!assistantContentRes.isValid) return Result.fail(assistantContentRes.getError());

    const assistantMessageIdRes = MessageId.create(this.generateUUID.run());
    if (!assistantMessageIdRes.isValid) return Result.fail(assistantMessageIdRes.getError());

    const assistantMessage = new Message({
      id: assistantMessageIdRes.getValue(),
      conversationId: conversation.id.value,
      role: MessageRole.assistant,
      content: assistantContentRes.getValue(),
      createdAt: new Date(),
    });

    const assistantSaveRes = await this.repository.addMessage(assistantMessage);
    if (!assistantSaveRes.isValid) return Result.fail(assistantSaveRes.getError());

    return Result.ok({
      conversationId: conversation.id.value,
      userMessage: userMessage.toPlain(),
      assistantMessage: assistantMessage.toPlain(),
    });
  }
}
