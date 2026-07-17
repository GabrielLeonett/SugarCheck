import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import type { GetOneByUsernameInterface } from './ports/GetOneByUsernameInterface';

@Injectable()
export class LoginUser {
  constructor(
    @Inject('GetOneByUsernameUser')
    private readonly GetOneByUsernameUser: GetOneByUsernameInterface,
    @Inject('BcryptHasher')
    private readonly Hasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) { }

  async run(
    data: { username: string; password: string },
  ): Promise<Result<{ at: string; rt: string; user: any }, ErrorAbstract>> {
    const userResult = await this.GetOneByUsernameUser.run({ username: data.username });

    if (!userResult.isValid) {
      return Result.fail(
        new InvalidCredentialsError('Credenciales Invalidas'),
      );
    }

    const user = userResult.getValue().toPlain();

    const isMatch = await this.Hasher.compare(
      data.password,
      user.password,
    );

    if (!isMatch) {
      return Result.fail(
        new InvalidCredentialsError('Credenciales Invalidas'),
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      fechaNacimiento: user.fechaNacimiento,
      sexo: user.sexo,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
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
        fechaNacimiento: user.fechaNacimiento,
        sexo: user.sexo,
      },
    });
  }
}
