import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly translationService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const lang = this.translationService.resolveLanguage(request.headers['accept-language'] as string);

    // La app móvil envía el token en `Authorization: Bearer`; la web usa la
    // cookie httpOnly. Aceptamos ambos para no depender del cookie jar de
    // React Native (que puede perder la cookie y cerrar la sesión).
    const authorization = request.headers['authorization'];
    const bearerToken =
      typeof authorization === 'string' &&
      authorization.toLowerCase().startsWith('bearer ')
        ? authorization.slice(7).trim()
        : null;

    const cookieToken = request.cookies['access_token'];
    const token = bearerToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException(this.translationService.translate('MISSING_TOKEN', lang));
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(this.translationService.translate('INVALID_OR_EXPIRED_TOKEN', lang));
    }

    return true;
  }
}
