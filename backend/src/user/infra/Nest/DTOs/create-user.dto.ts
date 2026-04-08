import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  email!: string;

  @IsArray({ message: 'Roles debe ser un arreglo' })
  @IsString({ each: true, message: 'Cada rol debe ser un texto' })
  @IsOptional()
  roles!: string[];

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDate({ message: 'Debe ser una fecha válida (ISO 8601)' })
  @Type(() => Date) // Esto garantiza que en el Caso de Uso sea un objeto Date real
  fechaNacimiento!: Date;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
