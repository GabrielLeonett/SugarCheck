import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateContactEmergenceDTO {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsString({ message: 'El parentesco debe ser un texto válido' })
  @IsIn(
    ['madre', 'padre', 'hermano', 'hermana', 'abuelo', 'abuela', 'tio', 'tia', 'tutor', 'otro'],
    { message: 'El parentesco no es válido' },
  )
  parentesco!: string;

  @IsString({ message: 'El teléfono debe ser un texto válido' })
  @IsOptional()
  telefono?: string;
}
