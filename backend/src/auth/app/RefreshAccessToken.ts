import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { ExpiredTokenError } from '../core/errors/ExpiredTokenError';
import type { GetOneByIdInterface } from './ports/GetOneByIdInterface';
import { UserPlainInterface } from './ports/UserInterface';

@Injectable()
export class RefreshAccessToken {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('GetOneByIdUser')
    private readonly getUserById: GetOneByIdInterface,
  ) {}

  async run(
    refreshToken: string,
  ): Promise<Result<{ at: string; rt: string; user: any }, ErrorAbstract>> {
    try {
      // 1. Verificar firma y expiración del token de refresco
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 2. Validar que el usuario aún exista en el sistema
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

      // 3. Convertimos a datos planos para obtener la data fresca y desacoplada
      const user: UserPlainInterface = userEntity.toPlain();

      // 4. Generar payload actualizado con tipos primitivos limpios
      const newPayload = {
        sub: user.id,
        name: user.name,
        roles: user.roles,
      };

      // 5. Rotación de tokens (Estrategia de seguridad para EduFlow)
      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
        this.jwtService.signAsync(newPayload, { expiresIn: '7d' }),
      ]);

      // 6. Retornar los nuevos tokens y la info plana del usuario
      return Result.ok({ 
        at, 
        rt, 
        user: { 
          id: user.id, 
          name: user.name, 
          roles: user.roles 
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