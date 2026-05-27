import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import { LoginDTO } from '../infra/DTOs/login.dto';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import type { GetOneByEmailInterface } from './ports/GetOneByEmailInterface';

@Injectable()
export class LoginUser {
  constructor(
    @Inject('GetOneByEmailUser')
    private readonly GetOneByEmailUser: GetOneByEmailInterface,
    @Inject('BcryptHasher')
    private readonly Hasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async run(
    dto: LoginDTO,
  ): Promise<Result<{ at: string; rt: string; user: any }, ErrorAbstract>> {
    // 1. Buscar la entidad del usuario en la base de datos
    const userResult = await this.GetOneByEmailUser.run({ email: dto.email });

    /**
     * IMPORTANTE: Si el usuario no existe, devolvemos InvalidCredentialsError.
     * No decimos "Usuario no encontrado" por seguridad, para evitar enumeración de cuentas.
     */
    if (!userResult.isValid) {
      return Result.fail(
        new InvalidCredentialsError('Credenciales Invalidas'),
      );
    }

    const user = userResult.getValue().toPlain();

    // 2. Comparar contraseñas usando el Value Object de la entidad antes de aplanar
    const isMatch = await this.Hasher.compare(
      dto.password,
      user.password,
    );

    if (!isMatch) {
      return Result.fail(
        new InvalidCredentialsError('Credenciales Invalidas'),
      );
    }


    // 4. Generar Payload limpio para el ecosistema de JWT
    const payload = {
      sub: user.id,
      name: user.name,
      roles: user.roles,
    };

    // 5. Firmar Tokens (Access Token y Refresh Token)
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    // 6. Retornar los tokens junto con la data mapeada del usuario
    return Result.ok({ 
      at, 
      rt, 
      user: { 
        id: user.id, 
        name: user.name, 
        roles: user.roles 
      } 
    });
  }
}