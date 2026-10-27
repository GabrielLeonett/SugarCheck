import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class ChangePasswordDTO {
  @IsString({ message: 'La contraseña actual debe ser un texto válido' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  currentPassword!: string;

  @IsString({ message: 'La nueva contraseña debe ser un texto válido' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/\d/, {
    message: 'La nueva contraseña debe incluir al menos un número',
  })
  newPassword!: string;
}
