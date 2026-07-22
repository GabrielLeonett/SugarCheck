import { Module } from '@nestjs/common';
import { InsulinaController } from './insulina.controller';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { PrismaInsulinaRepository } from '../PrismaInsulinaRepository/PrismaInsulinaRepository';
import { CreateInsulina } from '../../app/CreateInsulina';
import { GetAllInsulinas } from '../../app/GetAllInsulinas';
import { GetOneInsulina } from '../../app/GetOneInsulina';
import { UpdateInsulina } from '../../app/UpdateInsulina';
import { DeleteInsulina } from '../../app/DeleteInsulina';
import { GetTotalsInsulina } from '../../app/GetTotalsInsulina';
import { AuthModule } from '../../../auth/infra/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    PrismaService,
    GenerateUUID,
    {
      provide: 'InsulinaRepository',
      useClass: PrismaInsulinaRepository,
    },
    {
      provide: 'CreateInsulina',
      useFactory: (repo: PrismaInsulinaRepository, uuid: GenerateUUID) =>
        new CreateInsulina(repo, uuid),
      inject: ['InsulinaRepository', GenerateUUID],
    },
    {
      provide: 'GetAllInsulinas',
      useFactory: (repo: PrismaInsulinaRepository) =>
        new GetAllInsulinas(repo),
      inject: ['InsulinaRepository'],
    },
    {
      provide: 'GetOneInsulina',
      useFactory: (repo: PrismaInsulinaRepository) =>
        new GetOneInsulina(repo),
      inject: ['InsulinaRepository'],
    },
    {
      provide: 'UpdateInsulina',
      useFactory: (repo: PrismaInsulinaRepository) =>
        new UpdateInsulina(repo),
      inject: ['InsulinaRepository'],
    },
    {
      provide: 'DeleteInsulina',
      useFactory: (repo: PrismaInsulinaRepository) =>
        new DeleteInsulina(repo),
      inject: ['InsulinaRepository'],
    },
    {
      provide: 'GetTotalsInsulina',
      useFactory: (repo: PrismaInsulinaRepository) =>
        new GetTotalsInsulina(repo),
      inject: ['InsulinaRepository'],
    },
  ],
  controllers: [InsulinaController],
  exports: ['InsulinaRepository'],
})
export class InsulinaModule {}