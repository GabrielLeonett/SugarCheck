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
import type { Response, Request } from 'express';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import { FirebaseAdminService } from './firebase-admin.service';
import { LoginFirebaseDTO } from './DTOs/login-firebase.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  // Constante para no repetir la configuración de la cookie
  private readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: '/', // ➔ CAMBIADO A '/' para evitar líos al limpiar o interceptar desde cualquier ruta
  };

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(data.email, data.password);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
    }

    const { at, rt, user } = result.getValue();

    // Guardamos el Refresh Token en la cookie usando las opciones centralizadas
    response.cookie('refresh_token', rt, this.cookieOptions);

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
    const token = req.cookies['refresh_token'];
    if (!token) throw new UnauthorizedException('No hay token de refresco');

    const result = await this.authService.refreshToken(token);
    const { at, rt, user } = result.getValue();

    // Renovamos la cookie
    res.cookie('refresh_token', rt, this.cookieOptions);

    return {
      message: 'Token renovado',
      user,
      accessToken: at,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout();

    // ➔ CORREGIDO: Para borrar una cookie, las opciones de 'path' y 'domain' DEBEN ser idénticas a cuando se creó
    res.clearCookie('refresh_token', {
      httpOnly: true,
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // Si mantienes '/auth/refresh' arriba, aquí también debes poner '/auth/refresh'
    });

    // Nota: Como no estás guardando 'access_token' en cookies (sino en la memoria del cliente), no hace falta borrarlo aquí.

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

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name;

    const result = await this.authService.loginFirebaseUser({ email, name, firebaseUid });
    const { at, rt, user } = result.getValue();

    res.cookie('refresh_token', rt, this.cookieOptions);

    return {
      message: 'Login con Firebase exitoso', // Ajustado el mensaje para que sea semántico
      user,
      accessToken: at,
    };
  }
}