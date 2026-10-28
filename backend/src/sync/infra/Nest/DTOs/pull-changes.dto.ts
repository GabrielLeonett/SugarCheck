import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PullChangesQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lastPulledAt debe ser un número (epoch ms)' })
  lastPulledAt?: number;
}
