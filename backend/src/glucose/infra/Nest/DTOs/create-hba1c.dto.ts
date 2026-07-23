import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateHbA1cDTO {
  @IsNumber({}, { message: 'El valor de HbA1c debe ser un número' })
  @IsNotEmpty({ message: 'El valor de HbA1c es obligatorio' })
  @Min(0.1, { message: 'El porcentaje de HbA1c debe ser mayor a 0' })
  @Max(20, { message: 'El porcentaje de HbA1c debe ser menor a 20' })
  valuePercent!: number;

  @IsDate({ message: 'La fecha del examen debe ser una fecha válida (ISO 8601)' })
  @Type(() => Date)
  examDate!: Date;
}
