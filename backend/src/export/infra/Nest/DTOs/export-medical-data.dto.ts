import { Transform } from 'class-transformer';
import { IsIn, IsOptional, Matches } from 'class-validator';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ExportMedicalDataDTO {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(['pdf', 'csv'])
  format?: 'pdf' | 'csv';

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, {
    message: 'La fecha inicial debe tener el formato YYYY-MM-DD',
  })
  from?: string;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, {
    message: 'La fecha final debe tener el formato YYYY-MM-DD',
  })
  to?: string;
}
