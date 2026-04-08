import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../../user/infra/Nest/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa ConfigService
import { BcryptHasher } from '../../shared/infrastructure/security/bcrypt-hasher';
import { AuthController } from './auth.controller';
import { RefreshAccessToken } from '../app/RefreshAccessToken';
import { LoginUser } from '../app/LoginUser';
import { Logout } from '../app/LogoutUser';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'BcryptHasher',
      useClass: BcryptHasher,
    },
    LoginUser,
    RefreshAccessToken,
    Logout,
    AuthService,
  ],
})
export class AuthModule {}
