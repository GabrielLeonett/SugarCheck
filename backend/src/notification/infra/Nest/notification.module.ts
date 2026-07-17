import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../../../auth/infra/auth.module';
import { FirestoreService } from '../../../shared/infrastructure/firestore.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from '../../core/NotificationRepository';
import { FirestoreNotificationRepository } from '../FirestoreNotificationRepository/FirestoreNotificationRepository';
import { GetAllNotificationsByUser } from '../../app/GetAllNotificationsByUser';
import { GetUnreadCountByUser } from '../../app/GetUnreadCountByUser';
import { MarkNotificationAsRead } from '../../app/MarkNotificationAsRead';
import { MarkAllNotificationsAsRead } from '../../app/MarkAllNotificationsAsRead';
import { CreateNotification } from '../../app/CreateNotification';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [
    FirestoreService,
    NotificationGateway,
    {
      provide: 'NotificationRepository',
      useClass: FirestoreNotificationRepository,
    },
    {
      provide: 'NotificationEventEmitter',
      useExisting: NotificationGateway,
    },
    GetAllNotificationsByUser,
    GetUnreadCountByUser,
    MarkNotificationAsRead,
    MarkAllNotificationsAsRead,
    CreateNotification,
  ],
  exports: ['NotificationRepository', 'NotificationEventEmitter', CreateNotification],
})
export class NotificationModule {}
