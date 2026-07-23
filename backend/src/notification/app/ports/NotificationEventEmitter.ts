import type { NotificationPlain } from '../../core/Notification';

export interface NotificationEventEmitter {
  sendToUser(userId: string, event: string, data: any): void;
}
