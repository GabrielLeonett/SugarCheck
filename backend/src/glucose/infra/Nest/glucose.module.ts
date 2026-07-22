import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { GlucoseController } from './glucose.controller';
import { HbA1cController } from './hba1c.controller';
import { PrismaGlucoseRepository } from '../PrismaGlucoseRepository/PrismaGlucoseRepository';
import { PrismaHbA1cRepository } from '../PrismaGlucoseRepository/PrismaHbA1cRepository';
import { GlucoseRepository } from '../../core/GlucoseRepository';
import { HbA1cRepository } from '../../core/HbA1cRepository';
import { CreateGlucose } from '../../app/CreateGlucose';
import { GetAllGlucose } from '../../app/GetAllGlucose';
import { UpdateGlucose } from '../../app/UpdateGlucose';
import { CreateHbA1c } from '../../app/CreateHbA1c';
import { GetAllHbA1c } from '../../app/GetAllHbA1c';
import { UpdateHbA1c } from '../../app/UpdateHbA1c';
import { AuthModule } from '../../../auth/infra/auth.module';
import { PreferenceModule } from '../../../preference/infra/Nest/preference.module';
import { NotificationModule } from '../../../notification/infra/Nest/notification.module';
import { GetOneByIdPreference } from '../../../preference/app/GetOneByUserIdPreference';
import { CreateNotification } from '../../../notification/app/CreateNotification';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => PreferenceModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    PrismaService,
    {
      provide: 'GlucoseRepository',
      useClass: PrismaGlucoseRepository,
    },
    {
      provide: 'HbA1cRepository',
      useClass: PrismaHbA1cRepository,
    },
    {
      provide: 'GenerateUUID',
      useClass: GenerateUUID,
    },
    {
      provide: 'CreateGlucose',
      useFactory: (
        repo: GlucoseRepository,
        generate: GenerateUUID,
        getPreference: GetOneByIdPreference,
        createNotification: CreateNotification,
      ) => new CreateGlucose(repo, generate, getPreference, createNotification),
      inject: ['GlucoseRepository', 'GenerateUUID', 'GetOneByIdPreference', CreateNotification],
    },
    {
      provide: 'GetAllGlucose',
      useFactory: (repo: GlucoseRepository) => new GetAllGlucose(repo),
      inject: ['GlucoseRepository'],
    },
    {
      provide: 'UpdateGlucose',
      useFactory: (repo: GlucoseRepository) => new UpdateGlucose(repo),
      inject: ['GlucoseRepository'],
    },
    {
      provide: 'CreateHbA1c',
      useFactory: (
        repo: HbA1cRepository,
        generate: GenerateUUID,
      ) => new CreateHbA1c(repo, generate),
      inject: ['HbA1cRepository', 'GenerateUUID'],
    },
    {
      provide: 'GetAllHbA1c',
      useFactory: (repo: HbA1cRepository) => new GetAllHbA1c(repo),
      inject: ['HbA1cRepository'],
    },
    {
      provide: 'UpdateHbA1c',
      useFactory: (repo: HbA1cRepository) => new UpdateHbA1c(repo),
      inject: ['HbA1cRepository'],
    },
  ],
  controllers: [GlucoseController, HbA1cController],
})
export class GlucoseModule {}
