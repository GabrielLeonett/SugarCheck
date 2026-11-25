import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../infra/cookie-options';
import type { RevokedTokenStoreInterface } from './ports/RevokedTokenStoreInterface';

@Injectable()
export class Logout {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('RevokedTokenStore')
    private readonly revokedTokenStore: RevokedTokenStoreInterface,
  ) {}

  /**
   * Revoca el refresh token presentado para que no pueda reutilizarse aunque
   * la cookie no se haya borrado en el navegador (o se haya copiado).
   *
   * Un token inválido o ya expirado no es un error: no hay nada que revocar.
   */
  async run(refreshToken?: string): Promise<Result<void, ErrorAbstract>> {
    if (!refreshToken) {
      return Result.ok(undefined);
    }

    let payload: { jti?: string; exp?: number } | null = null;

    try {
      payload = await this.jwtService.verifyAsync<{
        jti?: string;
        exp?: number;
      }>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      // Token expirado o mal firmado: no hay nada que revocar.
      return Result.ok(undefined);
    }

    if (!payload?.jti) {
      return Result.ok(undefined);
    }

    const expiresAt = payload.exp
      ? new Date(payload.exp * 1000)
      : new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    // Si el almacenamiento falla, dejamos que el controlador lo registre:
    // el logout debe continuar igualmente y borrar las cookies.
    await this.revokedTokenStore.revoke({
      jti: payload.jti,
      expiresAt,
    });

    return Result.ok(undefined);
  }
}
