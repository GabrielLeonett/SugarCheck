import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactEmergenceDTO {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
  name!: string;

  @IsString({ message: 'El parentesco debe ser un texto válido' })
  @IsIn(
    ['madre', 'padre', 'hermano', 'hermana', 'abuelo', 'abuela', 'tio', 'tia', 'tutor', 'otro'],
    { message: 'El parentesco no es válido' },
  )
  parentesco!: string;

  @IsString({ message: 'El teléfono debe ser un texto válido' })
  @IsOptional()
  @Matches(/^$|^[+0-9\s()-]{7,20}$/, {
    message: 'El teléfono debe tener entre 7 y 15 dígitos',
  })
  telefono?: string;
}
