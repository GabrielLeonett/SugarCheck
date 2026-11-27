import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTOs/login.dto';
import { ForgotPasswordDTO } from './DTOs/forgot-password.dto';
import { ResetPasswordDTO } from './DTOs/reset-password.dto';
import type { Response, Request } from 'express';
import { FirebaseAdminService } from './firebase-admin.service';
import { LoginFirebaseDTO } from './DTOs/login-firebase.dto';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';
import {
  ForgotPasswordRateLimitGuard,
  ResetPasswordRateLimitGuard,
} from './auth-rate-limit.guard';
import { cookieOptionsAccessToken, cookieOptionsRefreshToken, clearAuthCookieOptions } from './cookie-options';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly translationService: TranslationService,
  ) { }

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data.username, data.password);
    
    if (!result.isValid) throw result.getError();
    
    const { at, rt, user } = result.getValue();
    
    res.cookie('access_token', at, cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, cookieOptionsRefreshToken);
    
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return {
      message: this.translationService.translate('LOGIN_SUCCESS', lang),
      user,
      accessToken: at,
      ...this.mobileRefreshTokenPayload(req, rt),
    };
  }
  
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Web: cookie httpOnly. Mobile: header `X-Refresh-Token`, porque el cookie
    // jar de React Native no siempre conserva las cookies entre sesiones.
    const oldRefreshToken = this.getRefreshToken(req);
    
    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);

    if (!oldRefreshToken) {
      res.clearCookie('access_token', clearAuthCookieOptions());
      res.clearCookie('refresh_token', clearAuthCookieOptions());
      throw new UnauthorizedException(this.translationService.translate('MISSING_TOKEN', lang));
    }
    
    const result = await this.authService.refreshToken(oldRefreshToken);
    
    if (!result.isValid) {
      res.clearCookie('access_token', clearAuthCookieOptions());
      res.clearCookie('refresh_token', clearAuthCookieOptions());
      throw result.getError();
    }
    
    const { at, rt, user } = result.getValue();

    res.cookie('access_token', at, cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, cookieOptionsRefreshToken);
    
    return {
      message: this.translationService.translate('TOKEN_REFRESHED', lang),
      user,
      accessToken: at,
      ...this.mobileRefreshTokenPayload(req, rt),
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshToken(req);
    
    // Revocar el refresh token en el servidor si existe. Si falla (token
    // inválido, base de datos caída…) NO impedimos el borrado de las cookies:
    // el usuario debe poder cerrar sesión siempre.
    if (refreshToken) {
      try {
        await this.authService.logout(refreshToken);
      } catch (error) {
        this.logger.warn(
          `No se pudo revocar el refresh token al cerrar sesión: ${(error as Error)?.message}`,
        );
      }
    }
    
    // Limpiar TODAS las cookies de autenticación con exactamente los mismos
    // atributos con los que se crearon. Si no coinciden, el navegador ignora
    // el borrado en peticiones cross-site.
    res.clearCookie('access_token', clearAuthCookieOptions());
    res.clearCookie('refresh_token', clearAuthCookieOptions());

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
    
    const { at, rt, user, isNewUser } = result.getValue();
    
    res.cookie('access_token', at, cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, cookieOptionsRefreshToken);
    
    return {
      message: this.translationService.translate('FIREBASE_LOGIN_SUCCESS', lang, { provider: 'Firebase' }),
      user,
      accessToken: at,
      isNewUser,
      ...this.mobileRefreshTokenPayload(req, rt),
    };
  }

  @Post('forgot-password')
  @UseGuards(ForgotPasswordRateLimitGuard)
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
  @UseGuards(ResetPasswordRateLimitGuard)
  async resetPassword(
    @Body() body: ResetPasswordDTO,
    @Req() req: Request,
  ) {
    const result = await this.authService.resetPassword(body.email, body.code, body.password);

    if (!result.isValid) throw result.getError();

    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return { message: this.translationService.translate('PASSWORD_RESET_SUCCESS', lang) };
  }

  /**
   * El refresh token se entrega en el JSON solo a la app móvil, que lo guarda
   * en almacenamiento seguro. La web sigue usando únicamente la cookie
   * httpOnly y nunca recibe el token en el cuerpo de la respuesta.
   */
  private isMobileClient(req: Request): boolean {
    const platform = req.headers['x-client-platform'];
    const value = Array.isArray(platform) ? platform[0] : platform;
    return typeof value === 'string' && value.toLowerCase() === 'mobile';
  }

  private getRefreshToken(req: Request): string | undefined {
    // La app móvil manda el token explícito; tiene prioridad sobre la cookie,
    // que puede haberse quedado con una versión anterior tras una rotación.
    const header = req.headers['x-refresh-token'];
    const value = Array.isArray(header) ? header[0] : header;
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    const cookieToken = req.cookies?.['refresh_token'];
    return typeof cookieToken === 'string' && cookieToken.length > 0
      ? cookieToken
      : undefined;
  }

  private mobileRefreshTokenPayload(
    req: Request,
    refreshToken: string,
  ): { refreshToken?: string } {
    const header = req.headers['x-refresh-token'];
    const hasHeader = typeof header === 'string' && header.length > 0;
    return this.isMobileClient(req) || hasHeader ? { refreshToken } : {};
  }
}