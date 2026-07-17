import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name!: string;

  @IsString({ message: 'El nombre de usuario debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  username!: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  email?: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDate({ message: 'Debe ser una fecha válida (ISO 8601)' })
  @Type(() => Date)
  fechaNacimiento!: Date;

  @IsString({ message: 'El sexo debe ser un texto válido' })
  @IsIn(['masculino', 'femenino'], {
    message: 'El sexo debe ser masculino o femenino',
  })
  sexo!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
