import { IsString, IsNumber, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateInsulinaDTO {
  @IsString()
  tipo!: string;

  @IsNumber()
  @Min(0.5)
  @Max(100)
  dosis!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dia!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  anio!: number;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora debe tener formato HH:mm' })
  hora!: string;

  @IsString()
  zona!: string;

  @IsOptional()
  @IsString()
  contexto?: string;
}

export class UpdateInsulinaDTO {
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(100)
  dosis?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dia?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora debe tener formato HH:mm' })
  hora?: string;

  @IsOptional()
  @IsString()
  zona?: string;

  @IsOptional()
  @IsString()
  contexto?: string;
}

export class QueryInsulinaDTO {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}