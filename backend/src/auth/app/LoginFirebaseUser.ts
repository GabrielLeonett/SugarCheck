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

    // CORRECCIÓN: Tipado directo con la Interfaz
    let user: UserPlainInterface;

    if (!userResult.isValid) {
      // 2. Si no existe, hacemos el AUTO-REGISTRO
      const saveResult = await this.SaveUser.run({
        name: dto.name,
        email: dto.email,
        roles: [Role.Guerrero], // Asignamos un rol por defecto, puedes ajustar esto según tu lógica
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
      name: user.name,
      roles: user.roles,
    };

    // 5. Firmar los tokens de tu aplicación
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
        roles: user.roles,
      },
    });
  }
}