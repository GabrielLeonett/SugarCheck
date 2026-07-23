import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { GetAllNotificationsByUser } from '../../app/GetAllNotificationsByUser';
import { GetUnreadCountByUser } from '../../app/GetUnreadCountByUser';
import { MarkNotificationAsRead } from '../../app/MarkNotificationAsRead';
import { MarkAllNotificationsAsRead } from '../../app/MarkAllNotificationsAsRead';
import { NotificationQueryDTO } from './DTOs/notification-query.dto';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';
import type { Request } from 'express';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(
    private readonly getAllNotificationsByUser: GetAllNotificationsByUser,
    private readonly getUnreadCountByUser: GetUnreadCountByUser,
    private readonly markNotificationAsRead: MarkNotificationAsRead,
    private readonly markAllNotificationsAsRead: MarkAllNotificationsAsRead,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async getAll(@Req() req: Request, @Query() query: NotificationQueryDTO) {
    const userId = (req as any).user.sub;
    const result = await this.getAllNotificationsByUser.run(userId, query.filter);
    if (!result.isValid) throw result.getError();
    return result.getValue().map((n) => n.toPlain());
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const result = await this.getUnreadCountByUser.run(userId);
    if (!result.isValid) throw result.getError();
    return { count: result.getValue() };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const result = await this.markNotificationAsRead.run(id);
    if (!result.isValid) throw result.getError();
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return { message: this.translationService.translate('NOTIFICATION_MARKED_READ', lang) };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const result = await this.markAllNotificationsAsRead.run(userId);
    if (!result.isValid) throw result.getError();
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return { message: this.translationService.translate('NOTIFICATIONS_ALL_READ', lang) };
  }
}
