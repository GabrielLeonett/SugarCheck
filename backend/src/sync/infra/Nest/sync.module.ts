import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { SyncController } from './sync.controller';
import { PrismaSyncRepository } from '../PrismaSyncRepository/PrismaSyncRepository';
import { SyncRepository } from '../../core/SyncRepository';
import { PushChanges } from '../../app/PushChanges';
import { PullChanges } from '../../app/PullChanges';
import { AuthModule } from '../../../auth/infra/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    PrismaService,
    {
      provide: 'SyncRepository',
      useClass: PrismaSyncRepository,
    },
    {
      provide: 'PushChanges',
      useFactory: (repo: SyncRepository) => new PushChanges(repo),
      inject: ['SyncRepository'],
    },
    {
      provide: 'PullChanges',
      useFactory: (repo: SyncRepository) => new PullChanges(repo),
      inject: ['SyncRepository'],
    },
  ],
  controllers: [SyncController],
})
export class SyncModule {}
