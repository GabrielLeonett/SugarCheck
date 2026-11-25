import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../../user/infra/Nest/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcryptHasher } from '../../shared/infrastructure/security/bcrypt-hasher';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { RefreshAccessToken } from '../app/RefreshAccessToken';
import { LoginUser } from '../app/LoginUser';
import { Logout } from '../app/LogoutUser';
import { AuthGuard } from './auth.guard';
import { OptionalAuthGuard } from './optionalAuth.guard';
import { RolesGuard } from './roles.guard';
import { FirebaseAdminService } from './firebase-admin.service';
import { LoginFirebaseUser } from '../app/LoginFirebaseUser';
import { ForgotPassword } from '../app/ForgotPassword';
import { ResetPassword } from '../app/ResetPassword';
import { NodemailerService } from './email/nodemailer.service';
import { ResetCodeStore } from './ResetCodeStore';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { PrismaRevokedTokenStore } from './PrismaRevokedTokenStore/PrismaRevokedTokenStore';
import {
  ForgotPasswordRateLimitGuard,
  ResetPasswordRateLimitGuard,
} from './auth-rate-limit.guard';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        return {
          secret: secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    PrismaService,
    AuthGuard,
    OptionalAuthGuard,
    RolesGuard,
    {
      provide: 'RevokedTokenStore',
      useClass: PrismaRevokedTokenStore,
    },
    {
      provide: 'BcryptHasher',
      useClass: BcryptHasher,
    },
    {
      provide: 'NodemailerService',
      useClass: NodemailerService,
    },
    {
      provide: 'ResetCodeStore',
      useClass: ResetCodeStore,
    },
    ForgotPasswordRateLimitGuard,
    ResetPasswordRateLimitGuard,
    LoginUser,
    RefreshAccessToken,
    Logout,
    LoginFirebaseUser,
    ForgotPassword,
    ResetPassword,
    AuthService,
    FirebaseAdminService,
    OAuthService,
  ],
  exports: [JwtModule, AuthGuard, OptionalAuthGuard, RolesGuard, FirebaseAdminService],
})
export class AuthModule { }