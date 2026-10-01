import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { Conversation } from '../../core/conversation/Conversation';
import { ConversationId } from '../../core/conversation/value-objects/ConversationId';
import { ConversationTitle } from '../../core/conversation/value-objects/ConversationTitle';
import { Message } from '../../core/conversation/message/Message';
import { MessageId } from '../../core/conversation/message/value-objects/MessageId';
import { MessageContent } from '../../core/conversation/message/value-objects/MessageContent';
import { MessageRole } from '../../core/conversation/message/value-objects/MessageRole';
import { ConversationNotFoundError } from '../../core/conversation/errors/ConversationNotFoundError';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { DatabaseError } from '../../../shared/DatabaseError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

interface MessageDB {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface ConversationDB {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageDB[];
}

@Injectable()
export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomainMessage(raw: MessageDB): Message {
    return new Message({
      id: MessageId.create(raw.id).getValue(),
      conversationId: raw.conversationId,
      role: MessageRole.create(raw.role).getValue(),
      content: MessageContent.create(raw.content).getValue(),
      createdAt: raw.createdAt,
    });
  }

  private toDomainConversation(raw: ConversationDB): Conversation {
    return new Conversation({
      id: ConversationId.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      title: ConversationTitle.create(raw.title).getValue(),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      messages: raw.messages.map((m) => this.toDomainMessage(m)),
    });
  }

  async save(conversation: Conversation): Promise<Result<Conversation, ErrorAbstract>> {
    try {
      const saved = await this.prisma.conversation.create({
        data: {
          id: conversation.id.value,
          userId: conversation.userId.value,
          title: conversation.title.value,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        include: { messages: true },
      });
      return Result.ok(this.toDomainConversation(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(new DatabaseError('El usuario asociado no existe'));
      }
      return Result.fail(new DatabaseError('Error al crear la conversación'));
    }
  }

  async getById(id: ConversationId): Promise<Result<Conversation, ErrorAbstract>> {
    try {
      const record = await this.prisma.conversation.findUnique({
        where: { id: id.value },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (!record) {
        return Result.fail(new ConversationNotFoundError(`Conversación ${id.value} no encontrada`));
      }
      return Result.ok(this.toDomainConversation(record));
    } catch (error) {
      return Result.fail(new DatabaseError('Error al obtener la conversación'));
    }
  }

  async listByUserId(userId: UserId): Promise<Result<Conversation[], ErrorAbstract>> {
    try {
      const records = await this.prisma.conversation.findMany({
        where: { userId: userId.value },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      return Result.ok(records.map((r) => this.toDomainConversation(r)));
    } catch (error) {
      return Result.fail(new DatabaseError('Error al obtener las conversaciones'));
    }
  }

  async addMessage(message: Message): Promise<Result<Message, ErrorAbstract>> {
    try {
      const saved = await this.prisma.$transaction(async (tx) => {
        const created = await tx.message.create({
          data: {
            id: message.id.value,
            conversationId: message.conversationId,
            role: message.role.value,
            content: message.content.value,
            createdAt: message.createdAt,
          },
        });
        await tx.conversation.update({
          where: { id: message.conversationId },
          data: { updatedAt: new Date() },
        });
        return created;
      });
      return Result.ok(this.toDomainMessage(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(new ConversationNotFoundError('La conversación no existe'));
      }
      return Result.fail(new DatabaseError('Error al guardar el mensaje'));
    }
  }

  async delete(id: ConversationId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.conversation.delete({ where: { id: id.value } });
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(new ConversationNotFoundError('La conversación no existe'));
      }
      return Result.fail(new DatabaseError('Error al eliminar la conversación'));
    }
  }
}
