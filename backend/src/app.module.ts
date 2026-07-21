import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './user/infra/Nest/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/infra/auth.module';
import { PreferenceModule } from './preference/infra/Nest/preference.module';
import { ContactEmergenceModule } from './contact_emergence/infra/Nest/contact-emergence.module';
import { NotificationModule } from './notification/infra/Nest/notification.module';
import { ImcModule } from './IMC/infra/Nest/imc.module';
import { InsulinaModule } from './insulina/infra/Nest/insulina.module';
import { I18nModule } from './shared/infrastructure/i18n/i18n.module';
import { GlobalExceptionFilter } from './shared/infrastructure/exception-filter';
import { TranslationService } from './shared/infrastructure/i18n/translation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'production'}`,
    }),
    I18nModule,
    UserModule,
    AuthModule,
    PreferenceModule,
    ContactEmergenceModule,
    NotificationModule,
    ImcModule,
    InsulinaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (translationService: TranslationService) => {
        return new GlobalExceptionFilter(translationService);
      },
      inject: [TranslationService],
    },
  ],
})
export class AppModule {}
