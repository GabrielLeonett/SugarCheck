import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class PushChangesDTO {
  @IsObject({ message: 'changes debe ser un objeto' })
  changes!: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lastPulledAt debe ser un número (epoch ms)' })
  lastPulledAt?: number;
}
