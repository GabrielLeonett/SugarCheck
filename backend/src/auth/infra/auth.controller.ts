import {
  Body,
  ConflictException,
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
  constructor(private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) { }

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(data.email, data.password);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InvalidCredentialsError) throw new UnauthorizedException(error.message)
    };


    const { at, rt, user } = result.getValue();

    // 1. Guardamos ÚNICAMENTE el Refresh Token en la cookie segura
    response.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más seguro que un año entero)
      path: '/auth/refresh', // Dejarlo en '/' evita problemas si cambias los prefijos globales de la API
    });

    return {
      message: 'Login exitoso',
      user: user,
      accessToken: at // El token de corta duración en memoria
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

    // Actualizamos las cookies con los nuevos tokens
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más seguro que un año entero)
      path: '/auth/refresh', // Dejarlo en '/' evita problemas si cambias los prefijos globales de la API
    });


    return {
      message: 'Token renovado',
      user: user,
      accessToken: at // El token de corta duración en memoria
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout();

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Sesión cerrada exitosamente' };
  }

  @Post('firebase-login')
  @HttpCode(HttpStatus.OK)
  async firebaseLogin(@Res({ passthrough: true }) res: Response, @Body() body: LoginFirebaseDTO) {
    // 1. Verificar el token contra los servidores de Firebase
    const decodedToken = await this.firebaseAdminService.verifyIdToken(body.token);

    if (!decodedToken) {
      throw new UnauthorizedException('Token de Firebase inválido o expirado');
    }

    // 2. Aquí ya tienes los datos seguros del usuario mapeados por Firebase
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name;

    const result = await this.authService.loginFirebaseUser({ email, name, firebaseUid });
    const { at, rt, user } = result.getValue();

    // Actualizamos las cookies con los nuevos tokens
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más seguro que un año entero)
      path: '/auth/refresh', // Dejarlo en '/' evita problemas si cambias los prefijos globales de la API
    });


    return {
      message: 'Token renovado',
      user: user,
      accessToken: at // El token de corta duración en memoria
    };
  }
}
