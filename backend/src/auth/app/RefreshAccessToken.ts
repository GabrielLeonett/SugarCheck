import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { ExpiredTokenError } from '../core/errors/ExpiredTokenError';
import { TokenRevokedError } from '../core/errors/TokenRevokedError';
import type { GetOneByIdInterface } from './ports/GetOneByIdInterface';
import type { RevokedTokenStoreInterface } from './ports/RevokedTokenStoreInterface';
import { UserPlainInterface } from './ports/UserInterface';

@Injectable()
export class RefreshAccessToken {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('GetOneByIdUser')
    private readonly getUserById: GetOneByIdInterface,
    @Inject('RevokedTokenStore')
    private readonly revokedTokenStore: RevokedTokenStoreInterface,
  ) {}

  async run(
    refreshToken: string,
  ): Promise<Result<{ at: string; rt: string; user: any }, ErrorAbstract>> {
    try {
      // 1. Verificar firma y expiración del token de refresco
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        jti?: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 2. Rechazar refresh tokens revocados explícitamente (logout).
      //    Protege el caso en el que la cookie sobrevive en el navegador.
      if (payload.jti && (await this.revokedTokenStore.isRevoked(payload.jti))) {
        return Result.fail(
          new TokenRevokedError(
            'La sesión ha sido cerrada. Por favor, inicia sesión de nuevo.',
          ),
        );
      }

      // 3. Validar que el usuario aún exista en el sistema
      const userResult = await this.getUserById.run({ id: payload.sub });

      if (!userResult.isValid) {
        // Si el usuario ya no existe (ej. fue eliminado), el token ya no es válido
        return Result.fail(
          new ExpiredTokenError(
            'La sesión ya no es válida. Por favor, inicia sesión de nuevo.',
          ),
        );
      }

      const userEntity = userResult.getValue();

      // Opcional: Validar si el usuario fue suspendido antes de refrescar (usando la entidad de dominio si es necesario)
      // if (userEntity._isActive && !userEntity._isActive.value) { ... }

      // 4. Convertimos a datos planos para obtener la data fresca y desacoplada
      const user: UserPlainInterface = userEntity.toPlain();

      // 5. Generar payload actualizado con tipos primitivos limpios
      const newPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
      };

      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
        // Cada refresh rota el `jti`; el token anterior deja de rastrearse y el
        // nuevo es el que se revocará en el próximo logout.
        this.jwtService.signAsync(newPayload, {
          expiresIn: '7d',
          jwtid: randomUUID(),
        }),
      ]);

      return Result.ok({ 
        at, 
        rt, 
        user: { 
          id: user.id, 
          name: user.name,
          username: user.username, 
          email: user.email,
          roles: user.roles,
          sexo: user.sexo,
          fechaNacimiento: user.fechaNacimiento,
        } 
      });
    } catch (error) {
      /**
       * Si jwtService.verifyAsync falla (token expirado, mal firmado o alterado),
       * caemos aquí y devolvemos un error de dominio limpio.
       */
      return Result.fail(
        new ExpiredTokenError('Tu sesión ha expirado o el token es inválido.'),
      );
    }
  }
}
