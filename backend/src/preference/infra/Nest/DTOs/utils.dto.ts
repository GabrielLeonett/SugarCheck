import { IsNotEmpty, IsNumber, IsString, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ThresholdsDTO {
  @IsNumber({}, { message: 'El umbral de hipoglucemia debe ser un número' })
  @IsNotEmpty({ message: 'El umbral de hipoglucemia es obligatorio' })
  hypo!: number;

  @IsNumber({}, { message: 'El umbral de hiperglucemia debe ser un número' })
  @IsNotEmpty({ message: 'El umbral de hiperglucemia es obligatorio' })
  hiper!: number;
}

export class InsulinRatiosDTO {
  @IsNumber({}, { message: 'El ratio del desayuno debe ser un número' })
  @IsNotEmpty({ message: 'El ratio del desayuno es obligatorio' })
  breakfast!: number;

  @IsNumber({}, { message: 'El ratio del almuerzo debe ser un número' })
  @IsNotEmpty({ message: 'El ratio del almuerzo es obligatorio' })
  lunch!: number;

  @IsNumber({}, { message: 'El ratio de la cena debe ser un número' })
  @IsNotEmpty({ message: 'El ratio de la cena es obligatorio' })
  dinner!: number;
}

export class CorrectionSchemaItemDTO {
  @IsNumber({}, { message: 'rangeMin debe ser un número' })
  @Min(0, { message: 'rangeMin debe ser mayor o igual a 0' })
  rangeMin!: number;

  @IsNumber({}, { message: 'rangeMax debe ser un número' })
  @Min(1, { message: 'rangeMax debe ser mayor a 0' })
  rangeMax!: number;

  @IsNumber({}, { message: 'La dosis debe ser un número' })
  @Min(1, { message: 'La dosis debe ser mayor a 0' })
  dose!: number;
}

export class BasalSchemaItemDTO {
  @IsString({ message: 'injectionTime debe ser un texto' })
  @IsNotEmpty({ message: 'injectionTime es obligatorio' })
  injectionTime!: string;

  @IsNumber({}, { message: 'La dosis debe ser un número' })
  @Min(1, { message: 'La dosis debe ser mayor a 0' })
  dose!: number;
}
