import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { ImcController } from './imc.controller';
import { PrismaImcRepository } from '../PrismaImcRepository/PrismaImcRepository';
import { ImcRepository } from '../../core/ImcRepository';
import { CreateImc } from '../../app/CreateImc';
import { GetAllImcByUserId } from '../../app/GetAllImcByUserId';
import { GetOneImcById } from '../../app/GetOneImcById';
import { UpdateImc } from '../../app/UpdateImc';
import { DeleteImc } from '../../app/DeleteImc';
import { AuthModule } from '../../../auth/infra/auth.module';
import { NotificationModule } from '../../../notification/infra/Nest/notification.module';
import { CreateNotification } from '../../../notification/app/CreateNotification';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => NotificationModule)],
  providers: [
    PrismaService,
    {
      provide: 'ImcRepository',
      useClass: PrismaImcRepository,
    },
    {
      provide: 'GenerateUUID',
      useClass: GenerateUUID,
    },
    {
      provide: 'CreateImc',
      useFactory: (
        repo: ImcRepository,
        generate: GenerateUUID,
        createNotification: CreateNotification,
      ) => new CreateImc(repo, generate, createNotification),
      inject: ['ImcRepository', 'GenerateUUID', CreateNotification],
    },
    {
      provide: 'GetAllImcByUserId',
      useFactory: (repo: ImcRepository) => new GetAllImcByUserId(repo),
      inject: ['ImcRepository'],
    },
    {
      provide: 'GetOneImcById',
      useFactory: (repo: ImcRepository) => new GetOneImcById(repo),
      inject: ['ImcRepository'],
    },
    {
      provide: 'UpdateImc',
      useFactory: (repo: ImcRepository) => new UpdateImc(repo),
      inject: ['ImcRepository'],
    },
    {
      provide: 'DeleteImc',
      useFactory: (repo: ImcRepository) => new DeleteImc(repo),
      inject: ['ImcRepository'],
    },
  ],
  controllers: [ImcController],
})
export class ImcModule {}
