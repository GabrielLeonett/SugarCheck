import { ErrorAbstract } from '../../../shared/error-abstract';

export class IdInsulinaInvalidoError extends ErrorAbstract {
  constructor() {
    super('ID de insulina inválido', {
      code: 'INVALID_INSULIN_ID',
      field: 'id',
    });
  }
}