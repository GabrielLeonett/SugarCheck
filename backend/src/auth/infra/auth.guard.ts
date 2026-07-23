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

    const token = request.cookies['access_token'];

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
