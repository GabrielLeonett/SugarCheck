import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

/**
 * Limitador en memoria por IP + email para los endpoints públicos de
 * recuperación de contraseña. Evita spam de correos y fuerza bruta.
 */
abstract class SlidingWindowRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();

  protected constructor(
    private readonly translationService: TranslationService,
    private readonly windowMs: number,
    private readonly maxRequests: number,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const email =
      typeof request.body?.email === 'string'
        ? request.body.email.trim().toLowerCase()
        : '';
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const key = `${ip}:${email}`;
    const now = Date.now();

    this.prune(now);

    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (bucket.count >= this.maxRequests) {
      const lang = this.translationService.resolveLanguage(
        (request.headers['accept-language'] as string) ?? 'es',
      );
      throw new HttpException(
        this.translationService.translate('TOO_MANY_ATTEMPTS', lang),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    return true;
  }

  private prune(now: number): void {
    if (this.buckets.size < 1000) return;

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}

@Injectable()
export class ForgotPasswordRateLimitGuard extends SlidingWindowRateLimitGuard {
  constructor(translationService: TranslationService) {
    // 5 solicitudes cada 15 minutos por IP + email
    super(translationService, 15 * 60 * 1000, 5);
  }
}

@Injectable()
export class ResetPasswordRateLimitGuard extends SlidingWindowRateLimitGuard {
  constructor(translationService: TranslationService) {
    // 10 intentos cada 15 minutos por IP + email
    super(translationService, 15 * 60 * 1000, 10);
  }
}
