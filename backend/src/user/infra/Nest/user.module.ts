import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../PrismaUserRepository/PrismaUserRepository';
import { UserController } from './user.controller';
import { PrismaService } from '../../../shared/prisma.service';
import { GetAllUser } from '../../application/GetAllUser';
import { SaveUser } from '../../application/SaveUser';
import { GetOneByEmailUser } from '../../application/GetOneByEmailUser';
import { GetOneByIdUser } from '../../application/GetOneByIdUser';
import { DeleteUser } from '../../application/DeleteUser';
import { UserRepository } from '../../core/UserRepository';
import { BcryptHasher } from '../security/bcrypt-hasher';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'BcryptHasher',
      useClass: BcryptHasher,
    },
    {
      provide: 'GetAllUser',
      useFactory: (repo: UserRepository) => new GetAllUser(repo),
      inject: ['UserRepository'], // Inyecta el repo que definimos arriba
    },
    {
      provide: 'SaveUser',
      useFactory: (repo: UserRepository, hash: BcryptHasher) =>
        new SaveUser(repo, hash),
      inject: ['UserRepository', 'BcryptHasher'],
    },
    {
      provide: 'GetOneByEmailUser',
      useFactory: (repo: UserRepository) => new GetOneByEmailUser(repo),
      inject: ['UserRepository'],
    },
    {
      provide: 'GetOneByIdUser',
      useFactory: (repo: UserRepository) => new GetOneByIdUser(repo),
      inject: ['UserRepository'],
    },
    {
      provide: 'DeleteUser',
      useFactory: (repo: UserRepository) => new DeleteUser(repo),
      inject: ['UserRepository'],
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
