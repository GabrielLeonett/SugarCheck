import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthServicePort } from '../../core/ports/auth-service.port';
import { User } from '../../core/User';

interface JwtPayload {
  sub: string; // El ID del usuario
  email: string; // El correo
  iat?: number; // Fecha de creación (automática)
  exp?: number; // Fecha de expiración (automática)
}

@Injectable()
export class JwtAuthAdapter implements AuthServicePort {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id.value, // ID del usuario
        email: user.email.value,
      },
      { 
        secret: process.env.SECRET_JWT,
        expiresIn: '1h', // Es buena práctica ponerle expiración
      },
    );
  }

  verifyToken(token: string): string {
    try {
      // Verificamos el token y obtenemos el objeto payload
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.SECRET_JWT,
      });

      // Retornamos el 'sub' que es el ID que guardamos arriba
      return payload.sub;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Si el token expiró o es inválido, lanzamos una excepción de Nest
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
