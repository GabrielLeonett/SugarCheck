import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../PrismaUserRepository/PrismaUserRepository';
import { UserController } from './user.controller';
import { PrismaService } from '../../../shared/prisma.service';
import { GetAllUser } from '../../application/GetAllUser';
import { SaveUser } from '../../application/SaveUser';
import { GetOneByEmailUser } from '../../application/GetOneByEmailUser';
import { GetOneByIdUser } from '../../application/GetOneByIdUser';
import { DeleteUser } from '../../application/DeleteUser';

@Module({
  providers: [
    PrismaService,
    GetAllUser, // Tus casos de uso
    SaveUser,
    GetOneByEmailUser,
    GetOneByIdUser,
    DeleteUser,
    {
      provide: 'UserRepository', // Este es el Token que usas en @Inject('UserRepository')
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
