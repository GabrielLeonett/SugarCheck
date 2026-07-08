import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { ContactEmergenceController } from './contact-emergence.controller';
import { PrismaContactEmergenceRepository } from '../PrismaContactEmergenceRepository/PrismaContactEmergenceRepository';
import { ContactEmergenceRepository } from '../../core/ContactEmergenceRepository';
import { SaveContactEmergence } from '../../app/SaveContactEmergence';
import { GetAllContactsByUserId } from '../../app/GetAllContactsByUserId';
import { GetOneContactById } from '../../app/GetOneContactById';
import { UpdateContactEmergence } from '../../app/UpdateContactEmergence';
import { DeleteContactEmergence } from '../../app/DeleteContactEmergence';
import { AuthModule } from '../../../auth/infra/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    PrismaService,
    {
      provide: 'ContactEmergenceRepository',
      useClass: PrismaContactEmergenceRepository,
    },
    {
      provide: 'GenerateUUID',
      useClass: GenerateUUID,
    },
    {
      provide: 'SaveContactEmergence',
      useFactory: (
        repo: ContactEmergenceRepository,
        generate: GenerateUUID,
      ) => new SaveContactEmergence(repo, generate),
      inject: ['ContactEmergenceRepository', 'GenerateUUID'],
    },
    {
      provide: 'GetAllContactsByUserId',
      useFactory: (repo: ContactEmergenceRepository) => new GetAllContactsByUserId(repo),
      inject: ['ContactEmergenceRepository'],
    },
    {
      provide: 'GetOneContactById',
      useFactory: (repo: ContactEmergenceRepository) => new GetOneContactById(repo),
      inject: ['ContactEmergenceRepository'],
    },
    {
      provide: 'UpdateContactEmergence',
      useFactory: (repo: ContactEmergenceRepository) => new UpdateContactEmergence(repo),
      inject: ['ContactEmergenceRepository'],
    },
    {
      provide: 'DeleteContactEmergence',
      useFactory: (repo: ContactEmergenceRepository) => new DeleteContactEmergence(repo),
      inject: ['ContactEmergenceRepository'],
    },
  ],
  controllers: [ContactEmergenceController],
})
export class ContactEmergenceModule {}
