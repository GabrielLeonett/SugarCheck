import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  id(
    name: string,
    email: string,
    roles: string[],
    fecha_nacimiento: Date,
    password: string,
  ) {
    throw new Error('Method not implemented.');
  }
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  email: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDate({ message: 'Debe ser una fecha válida' })
  @Type(() => Date)
  fecha_nacimiento: Date;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
