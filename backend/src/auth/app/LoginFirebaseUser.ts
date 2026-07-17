import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { InvalidCredentialsError } from '../core/errors/InvalidCredentialsError';
import type { GetOneByEmailInterface } from './ports/GetOneByEmailInterface';
import type { SaveUserInterface } from './ports/SaveUserInterface';
import { UserPlainInterface } from './ports/UserInterface';
import { Role } from '../../shared/enums/role.enum';

@Injectable()
export class LoginFirebaseUser {
  constructor(
    @Inject('GetOneByEmailUser')
    private readonly GetOneByEmailUser: GetOneByEmailInterface,
    @Inject('SaveUser')
    private readonly SaveUser: SaveUserInterface,
    private readonly jwtService: JwtService,
  ) { }

  async run(dto: {
    email: string;
    name: string;
    firebaseUid: string;
  }): Promise<Result<{ at: string; rt: string; user: any }, ErrorAbstract>> {

    // 1. Buscar si el usuario ya existe en tu base de datos local por email
    const userResult = await this.GetOneByEmailUser.run({ email: dto.email });

    let user: UserPlainInterface;

    if (!userResult.isValid) {
      const username = this.generateUsernameFromEmail(dto.email);
      const saveResult = await this.SaveUser.run({
        name: dto.name,
        username,
        email: dto.email,
        roles: [Role.Guerrero],
        sexo: 'masculino',
        fechaNacimiento: new Date('2000-01-01'),
        password: `FB_EXTERNAL_AUTH_${Math.random().toString(36).substring(2)}`,
      });

      if (!saveResult.isValid) {

        return Result.fail(saveResult.getError());
      }

      user = saveResult.getValue().toPlain();
    } else {
      // 3. Si ya existía, extraes el usuario
      user = userResult.getValue().toPlain();
    }

    // 4. Generar el Payload para TU propio ecosistema de JWT
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

  private generateUsernameFromEmail(email: string): string {
    let username = email.split('@')[0].toLowerCase();
    username = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!/^[a-zA-Z]/.test(username)) {
      username = 'u' + username;
    }
    username = username.substring(0, 30);
    if (username.length < 3) {
      username = username.padEnd(3, '_');
    }
    return username;
  }
}