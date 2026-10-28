import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';

// La contraseña se cambia únicamente mediante PATCH /user/password,
// donde se verifica la contraseña actual.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDTO, ['password'] as const),
) {}
