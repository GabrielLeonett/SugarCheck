import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../../shared/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtenemos los roles requeridos desde el decorador @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador @Roles, es pública para cualquier usuario logueado
    if (!requiredRoles) {
      return true;
    }

    // 2. Extraemos el usuario del request
    const { user } = context.switchToHttp().getRequest();

    // 3. ROBUSTEZ: Validamos que el usuario exista y tenga roles
    // Si no hay usuario (porque olvidaste el AuthGuard) o no tiene el array de roles, denegamos.
    if (!user || !user.roles) {
      return false; 
    }

    // 4. Verificación de permisos
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}