import { ErrorAbstract } from '../../../shared/error-abstract';

export class ExportDateRangeInvalidError extends ErrorAbstract {
  constructor(
    message = 'El rango de fechas no es válido. La fecha inicial debe ser anterior o igual a la final',
  ) {
    super(message, {
      code: 'EXPORT_INVALID_DATE_RANGE',
      field: 'from',
    });
  }
}
