import { IsOptional, IsIn } from 'class-validator';

export class NotificationQueryDTO {
  @IsOptional()
  @IsIn(['all', 'unread'], { message: 'Filter debe ser "all" o "unread"' })
  filter?: 'all' | 'unread';
}
