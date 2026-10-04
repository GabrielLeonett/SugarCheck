import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { StartConversation } from '../../app/conversation/StartConversation';
import { SendMessage } from '../../app/conversation/SendMessage';
import { StreamMessage } from '../../app/conversation/StreamMessage';
import { GetConversationHistory } from '../../app/conversation/GetConversationHistory';
import { GetUserConversations } from '../../app/conversation/GetUserConversations';
import { DeleteConversation } from '../../app/conversation/DeleteConversation';
import { StartConversationDTO } from './DTOs/start-conversation.dto';
import { SendMessageDTO } from './DTOs/send-message.dto';
import { ConversationNotFoundError } from '../../core/conversation/errors/ConversationNotFoundError';
import { ConversationAccessDeniedError } from '../../core/conversation/errors/ConversationAccessDeniedError';
import { LanguageModelError } from '../../core/conversation/errors/LanguageModelError';
import { ErrorAbstract } from '../../../shared/error-abstract';

@Controller('oraculo')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(
    @Inject('StartConversation')
    private readonly startConversation: StartConversation,
    @Inject('SendMessage')
    private readonly sendMessage: SendMessage,
    @Inject('StreamMessage')
    private readonly streamMessage: StreamMessage,
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

  /**
   * Igual que `POST /messages`, pero la respuesta del asistente llega por
   * trozos en lugar de de golpe.
   *
   * Primero se resuelve todo lo validable (contenido, política de seguridad,
   * pertenencia de la conversación) y recién entonces se abren los headers.
   * Así los rechazos siguen siendo errores HTTP normales —con su JSON y su
   * código— en vez de un stream que se corta a medio escribir.
   */
  @Post('conversations/:id/messages/stream')
  async sendStream(
    @Request() req: any,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: SendMessageDTO,
  ): Promise<void> {
    const prepared = await this.streamMessage.prepare({
      userId: req.user.sub,
      conversationId: id,
      content: body.content,
    });

    if (!prepared.isValid) {
      // Todavía no escribimos nada, así que el filtro de errores de Nest
      // puede responder con su formato habitual.
      throw this.toException(prepared.getError());
    }

    const context = prepared.getValue();

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Desactiva el buffering de nginx en proxies que lo tengan delante.
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    // Si el cliente cierra la pestaña o pulsa "detener", cortamos la generación.
    const abort = new AbortController();
    let clientGone = false;
    const onClose = () => {
      clientGone = true;
      abort.abort();
    };
    req.on('close', onClose);

    const send = (event: unknown) => {
      // `res.write` en un socket cerrado no lanza, pero `writableEnded` evita
      // que accumulationemos trabajo inútil.
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    try {
      send({ type: 'meta', userMessage: context.userMessage });

      let text = '';
      for await (const delta of this.streamMessage.run(context, abort.signal)) {
        if (clientGone) break;
        text += delta;
        send({ type: 'delta', text: delta });
      }

      if (clientGone) {
        // Aun así guardamos lo generado: el usuario ya lo vio en pantalla.
        if (text.trim()) await this.streamMessage.persist(context, text);
        return;
      }

      const saved = await this.streamMessage.persist(context, text);
      if (!saved.isValid) {
        send({ type: 'error', message: saved.getError().message });
        res.end();
        return;
      }

      send({ type: 'done', assistantMessage: saved.getValue() });
      res.end();
    } catch (error) {
      if (clientGone) return;

      send({ type: 'error', message: this.toStreamErrorMessage(error) });
      res.end();
    } finally {
      req.off('close', onClose);
    }
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

  /**
   * Traduce fallas técnicas a algo que se pueda mostrar. Un AbortError sin
   * traducir llegaría al usuario como "This operation was aborted".
   */
  private toStreamErrorMessage(error: unknown): string {
    if (error instanceof LanguageModelError) return error.message;

    const name = (error as { name?: string })?.name;
    if (name === 'AbortError' || name === 'TimeoutError') {
      return 'El asistente tardó demasiado en responder. Inténtalo de nuevo.';
    }

    return 'No se pudo generar una respuesta. Inténtalo de nuevo.';
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
