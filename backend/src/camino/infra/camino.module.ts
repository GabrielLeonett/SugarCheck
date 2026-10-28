import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infra/auth.module';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { CaminoController } from './camino.controller';
import { PrismaCaminoProgresoRepository } from './PrismaCaminoProgresoRepository';
import { GetCaminoProgreso } from '../app/GetCaminoProgreso';
import { CompletarNivelCamino } from '../app/CompletarNivelCamino';

@Module({
  imports: [AuthModule],
  controllers: [CaminoController],
  providers: [
    PrismaService,
    {
      provide: 'CaminoProgresoRepository',
      useClass: PrismaCaminoProgresoRepository,
    },
    {
      provide: GetCaminoProgreso,
      useFactory: (repo: PrismaCaminoProgresoRepository) => new GetCaminoProgreso(repo),
      inject: ['CaminoProgresoRepository'],
    },
    {
      provide: CompletarNivelCamino,
      useFactory: (repo: PrismaCaminoProgresoRepository) => new CompletarNivelCamino(repo),
      inject: ['CaminoProgresoRepository'],
    },
  ],
})
export class CaminoModule {}
