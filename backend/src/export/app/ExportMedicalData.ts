import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { ExportDateRangeInvalidError } from '../core/errors/ExportDateRangeInvalidError';
import { MedicalExportData, MedicalExportPeriod } from '../core/MedicalExportData';
import { MedicalExportRepository } from '../core/MedicalExportRepository';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface ExportMedicalDataInput {
  userId: string;
  from?: string;
  to?: string;
}

export class ExportMedicalData {
  constructor(private readonly repository: MedicalExportRepository) {}

  public async run(
    data: ExportMedicalDataInput,
  ): Promise<Result<MedicalExportData, ErrorAbstract>> {
    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const periodRes = this.buildPeriod(data.from, data.to);
    if (!periodRes.isValid) return Result.fail(periodRes.getError());

    return this.repository.getMedicalData(
      userIdRes.getValue().value,
      periodRes.getValue(),
    );
  }

  private buildPeriod(
    from?: string,
    to?: string,
  ): Result<MedicalExportPeriod, ErrorAbstract> {
    const fromDate = from ? this.parseDate(from, false) : null;
    const toDate = to ? this.parseDate(to, true) : null;

    if (from && !fromDate) {
      return Result.fail(
        new ExportDateRangeInvalidError(
          'La fecha inicial no es válida. Usa el formato YYYY-MM-DD',
        ).withCode('EXPORT_INVALID_DATE_RANGE', 'from'),
      );
    }

    if (to && !toDate) {
      return Result.fail(
        new ExportDateRangeInvalidError(
          'La fecha final no es válida. Usa el formato YYYY-MM-DD',
        ).withCode('EXPORT_INVALID_DATE_RANGE', 'to'),
      );
    }

    if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
      return Result.fail(new ExportDateRangeInvalidError());
    }

    return Result.ok({ from: fromDate, to: toDate });
  }

  private parseDate(value: string, endOfDay: boolean): Date | null {
    if (!DATE_ONLY_PATTERN.test(value)) return null;

    const [year, month, day] = value.split('-').map(Number);
    const date = endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }
}
