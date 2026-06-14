import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Extraemos el token de la cookie (gracias a cookie-parser)
    const token = request.cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('No se encontró un token de acceso');
    }

    try {
      // 2. Verificamos el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 3. Seteamos el payload en el request para que los controladores lo usen
      // Esto es fundamental para saber qué usuario está haciendo la petición
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }

    return true;
  }
}
