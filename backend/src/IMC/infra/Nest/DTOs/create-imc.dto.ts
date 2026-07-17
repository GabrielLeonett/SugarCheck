import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateImcDTO {
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsNotEmpty({ message: 'El peso es obligatorio' })
  @Min(0.1, { message: 'El peso debe ser mayor que 0' })
  @Max(699, { message: 'El peso debe ser menor que 700' })
  peso!: number;

  @IsNumber({}, { message: 'La altura debe ser un número' })
  @IsNotEmpty({ message: 'La altura es obligatoria' })
  @Min(0.1, { message: 'La altura debe ser mayor que 0' })
  @Max(279, { message: 'La altura debe ser menor que 280' })
  altura!: number;

  @IsNumber({}, { message: 'El día debe ser un número' })
  @IsNotEmpty({ message: 'El día es obligatorio' })
  @Min(1, { message: 'El día debe estar entre 1 y 31' })
  @Max(31, { message: 'El día debe estar entre 1 y 31' })
  dia!: number;

  @IsNumber({}, { message: 'El mes debe ser un número' })
  @IsNotEmpty({ message: 'El mes es obligatorio' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes!: number;

  @IsNumber({}, { message: 'El año debe ser un número' })
  @IsNotEmpty({ message: 'El año es obligatorio' })
  @Min(1900, { message: 'El año debe ser mayor o igual a 1900' })
  @Max(2100, { message: 'El año debe ser menor o igual a 2100' })
  anio!: number;
}
