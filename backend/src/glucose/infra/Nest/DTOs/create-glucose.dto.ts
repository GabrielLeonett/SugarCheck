import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString, Matches, Max, Min } from 'class-validator';

export class CreateGlucoseDTO {
  @IsNumber({}, { message: 'El valor de glucosa debe ser un número' })
  @IsNotEmpty({ message: 'El valor de glucosa es obligatorio' })
  @Min(1, { message: 'El valor de glucosa debe ser mayor a 0' })
  @Max(999, { message: 'El valor de glucosa debe ser menor a 1000' })
  valueMgdl!: number;

  @IsString({ message: 'La etiqueta de comida debe ser un texto' })
  @IsIn(['En Ayunas', 'Despues de comer', 'Control general'], {
    message: 'La etiqueta de comida debe ser: En Ayunas, Despues de comer o Control general',
  })
  mealTag!: string;

  @IsDate({ message: 'La fecha debe ser una fecha válida (ISO 8601)' })
  @Type(() => Date)
  date!: Date;

  @IsString({ message: 'La hora debe ser un texto' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'La hora debe tener formato HH:mm' })
  time!: string;
}
