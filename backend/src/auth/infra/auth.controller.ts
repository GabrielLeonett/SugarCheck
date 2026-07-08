import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTOs/login.dto';
import type { Response, Request } from 'express';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import { FirebaseAdminService } from './firebase-admin.service';
import { LoginFirebaseDTO } from './DTOs/login-firebase.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  private readonly isProduction = process.env.NODE_ENV === 'production';

  // Configuración centralizada de cookies
  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' as const : 'lax' as const,
      maxAge,
      path: '/',
    };
  }

  // Access Token: 15 minutos
  private readonly cookieOptionsAccessToken = this.getCookieOptions(15 * 60 * 1000);
  
  // Refresh Token: 7 días
  private readonly cookieOptionsRefreshToken = this.getCookieOptions(7 * 24 * 60 * 60 * 1000);

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data.username, data.password);
    
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Error de autenticación');
    }

    const { at, rt, user } = result.getValue();

    // Guardar tokens en cookies
    res.cookie('access_token', at, this.cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);

    return {
      message: 'Login exitoso',
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
    
    if (!oldRefreshToken) {
      // Limpiar cualquier cookie residual
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      throw new UnauthorizedException('No hay token de refresco');
    }

    try {
      // El servicio debe invalidar el refresh token antiguo
      const result = await this.authService.refreshToken(oldRefreshToken);
      const { at, rt, user } = result.getValue();

      // Renovar ambas cookies
      res.cookie('access_token', at, this.cookieOptionsAccessToken);
      res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);

      return {
        message: 'Token renovado',
        user,
        accessToken: at,
      };
    } catch (error) {
      // Si el refresh token es inválido, limpiar cookies
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
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

    return { message: 'Sesión cerrada exitosamente' };
  }

  @Post('firebase-login')
  @HttpCode(HttpStatus.OK)
  async firebaseLogin(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginFirebaseDTO,
  ) {
    const decodedToken = await this.firebaseAdminService.verifyIdToken(body.token);

    if (!decodedToken) {
      throw new UnauthorizedException('Token de Firebase inválido o expirado');
    }

    const { uid, email, name } = decodedToken;
    const result = await this.authService.loginFirebaseUser({ 
      email, 
      name, 
      firebaseUid: uid 
    });
    
    const { at, rt, user } = result.getValue();

    res.cookie('access_token', at, this.cookieOptionsAccessToken);
    res.cookie('refresh_token', rt, this.cookieOptionsRefreshToken);

    return {
      message: 'Login con Firebase exitoso',
      user,
      accessToken: at,
    };
  }

}