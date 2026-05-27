import { forwardRef, Module } from '@nestjs/common';
import { PreferenceController } from './preference.controller';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { SavePreference } from '../../app/SavePreference';
import { PreferenceRepository } from '../../core/PreferenceRepository';
import { PrismaPreferenceRepository } from '../PrismaPreferenceRepository/PrismaPreferenceRepository';
import { GetOneByIdPreference } from '../../app/GetOneByUserIdPreference';
import { AuthModule } from '../../../auth/infra/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    PrismaService,
    {
      provide: 'PreferenceRepository',
      useClass: PrismaPreferenceRepository,
    },
    {
      provide: 'GetOneByIdPreference',
      useFactory: (repo: PreferenceRepository) => new GetOneByIdPreference(repo),
      inject: ['PreferenceRepository'],
    },
    {
      provide: 'SavePreference',
      useFactory: (repo: PreferenceRepository) => new SavePreference(repo),
      inject: ['PreferenceRepository'],
    },

  ],
  controllers: [PreferenceController],
})
export class PreferenceModule { }
