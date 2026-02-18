import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { GetAllUser } from 'src/user/application/GetAllUser';
import { SaveUser } from 'src/user/application/SaveUser';
import { PrismaUserRepository } from '../PrismaUserRepository/PrismaUserRepository';
import { UserController } from './user.controller';

@Module({
  providers: [
    PrismaService,
    GetAllUser, // Tus casos de uso
    SaveUser,
    {
      provide: 'UserRepository', // Este es el Token que usas en @Inject('UserRepository')
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
