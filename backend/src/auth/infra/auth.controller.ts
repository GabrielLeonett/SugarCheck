import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTOs/login.dto';
import { ForgotPasswordDTO } from './DTOs/forgot-password.dto';
import { ResetPasswordDTO } from './DTOs/reset-password.dto';
import type { Response, Request } from 'express';
import { FirebaseAdminService } from './firebase-admin.service';
import { LoginFirebaseDTO } from './DTOs/login-firebase.dto';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly translationService: TranslationService,
  ) { }

  private readonly isProduction = process.env.NODE_ENV === 'production';

  // Configuración centralizada de cookies
  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      // En producción requiere HTTPS (true), en desarrollo puede ser false
      secure: this.isProduction,
      // 'none' es obligatorio en producción para permitir cookies cross-site (con secure: true)
      // 'lax' es ideal para desarrollo local
      sameSite: this.isProduction ? 'none' as const : 'lax' as const,
      maxAge,
      path: '/',
      // Si estás en producción, es buena práctica añadir 'domain' si es necesario
      // domain: this.isProduction ? '.tu-dominio.com' : undefined,
    };
  }

  // Access Token: 15 minutos
  private readonly cookieOptionsAccessToken = this.getCookieOptions(15 * 60 * 1000);

  // Refresh Token: 7 días
  private readonly cookieOptionsRefreshToken = this.getCookieOptions(7 * 24 * 60 * 60 * 1000);

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data.username, data.password);
    
    if (!result.isValid) throw result.getError();
    
    const { at, rt, user } = result.getValue();
    
    res.cookie('access_token', at, this.cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);
    
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return {
      message: this.translationService.translate('LOGIN_SUCCESS', lang),
      user,
      accessToken: at,
    };
  }
  
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies['refresh_token'];
    
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);

    if (!oldRefreshToken) {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      throw new UnauthorizedException(this.translationService.translate('MISSING_TOKEN', lang));
    }
    
    const result = await this.authService.refreshToken(oldRefreshToken);
    
    if (!result.isValid) {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      throw result.getError();
    }
    
    const { at, rt, user } = result.getValue();

    res.cookie('access_token', at, this.cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);
    
    return {
      message: this.translationService.translate('TOKEN_REFRESHED', lang),
      user,
      accessToken: at,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    
    // Invalidar refresh token en el servidor si existe
    if (refreshToken) {
      await this.authService.logout();
    }
    
    // Limpiar TODAS las cookies de autenticación
    const clearCookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
    };
    
    res.clearCookie('access_token', clearCookieOptions);
    res.clearCookie('refresh_token', clearCookieOptions);

    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return { message: this.translationService.translate('LOGOUT_SUCCESS', lang) };
  }
  
  @Post('firebase-login')
  @HttpCode(HttpStatus.OK)
  async firebaseLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginFirebaseDTO,
  ) {
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    const decodedToken = await this.firebaseAdminService.verifyIdToken(body.token);
    
    if (!decodedToken) {
      throw new UnauthorizedException(this.translationService.translate('INVALID_OR_EXPIRED_TOKEN', lang));
    }
    
    const { uid, email, name } = decodedToken;
    const result = await this.authService.loginFirebaseUser({
      email,
      name,
      firebaseUid: uid
    });
    
    if (!result.isValid) throw result.getError();
    
    const { at, rt, user } = result.getValue();
    
    res.cookie('access_token', at, this.cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);
    
    return {
      message: this.translationService.translate('FIREBASE_LOGIN_SUCCESS', lang, { provider: 'Firebase' }),
      user,
      accessToken: at,
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDTO,
    @Req() req: Request,
  ) {
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    const result = await this.authService.forgotPassword(body.email, lang);

    if (!result.isValid) throw result.getError();

    return { message: this.translationService.translate('RESET_EMAIL_SENT', lang) };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDTO,
    @Req() req: Request,
  ) {
    const result = await this.authService.resetPassword(body.email, body.code, body.password);

    if (!result.isValid) throw result.getError();

    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return { message: this.translationService.translate('PASSWORD_RESET_SUCCESS', lang) };
  }
  
}