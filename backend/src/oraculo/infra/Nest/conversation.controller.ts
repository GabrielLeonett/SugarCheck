import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { StartConversation } from '../../app/conversation/StartConversation';
import { SendMessage } from '../../app/conversation/SendMessage';
import { GetConversationHistory } from '../../app/conversation/GetConversationHistory';
import { GetUserConversations } from '../../app/conversation/GetUserConversations';
import { DeleteConversation } from '../../app/conversation/DeleteConversation';
import { StartConversationDTO } from './DTOs/start-conversation.dto';
import { SendMessageDTO } from './DTOs/send-message.dto';
import { ConversationNotFoundError } from '../../core/conversation/errors/ConversationNotFoundError';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { ErrorAbstract } from '../../../shared/error-abstract';

@Controller('oraculo')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(
    @Inject('StartConversation')
    private readonly startConversation: StartConversation,
    @Inject('SendMessage')
    private readonly sendMessage: SendMessage,
    @Inject('GetConversationHistory')
    private readonly getConversationHistory: GetConversationHistory,
    @Inject('GetUserConversations')
    private readonly getUserConversations: GetUserConversations,
    @Inject('DeleteConversation')
    private readonly deleteConversation: DeleteConversation,
  ) {}

  @Post('conversations')
  async start(@Request() req: any, @Body() body: StartConversationDTO) {
    const userId = req.user.sub;
    const result = await this.startConversation.run({ userId, title: body.title });
    if (!result.isValid) {
      throw this.toException(result.getError());
    }
    return result.getValue().toPlain();
  }

  @Get('conversations')
  async list(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getUserConversations.run({ userId });
    if (!result.isValid) {
      throw this.toException(result.getError());
    }
    return result.getValue().map((c) => c.toPlain());
  }

  @Get('conversations/:id')
  async history(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const result = await this.getConversationHistory.run({ userId, conversationId: id });
    if (!result.isValid) {
      throw this.toException(result.getError());
    }
    return result.getValue().toPlain();
  }

  @Post('conversations/:id/messages')
  async send(@Request() req: any, @Param('id') id: string, @Body() body: SendMessageDTO) {
    const userId = req.user.sub;
    const result = await this.sendMessage.run({
      userId,
      conversationId: id,
      content: body.content,
    });
    if (!result.isValid) {
      throw this.toException(result.getError());
    }
    return result.getValue();
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const result = await this.deleteConversation.run({ userId, conversationId: id });
    if (!result.isValid) {
      throw this.toException(result.getError());
    }
  }

  private toException(error: ErrorAbstract): Error {
    if (error instanceof ConversationNotFoundError) {
      return new NotFoundException(error.message);
    }
    if (error instanceof ConversationAccessDeniedError) {
      return new ForbiddenException(error.message);
    }
    return new BadRequestException(error.message);
  }
}
