import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTOs/login.dto';
import type { Response, Request } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(data.email, data.password);
    if (!result.isValid) throw result.getError();

    const { at, rt } = result.getValue();

    // Cookie para el Access Token
    response.cookie('access_token', at, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    // Cookie para el Refresh Token (Más persistente)
    response.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 7 * 24 * 60 * 60 * 1000, // 365 días
      path: '/auth/refresh', // Solo se envía a la ruta de refresh por seguridad
    });

    return {
      message: 'Login exitoso',
      user: { email: data.email },
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
    const { at, rt } = result.getValue();

    // Actualizamos las cookies con los nuevos tokens
    res.cookie('access_token', at, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token renovado' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout();

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');


    return { message: 'Sesión cerrada exitosamente' };
  }
}
