import { ErrorAbstract } from '../../../shared/error-abstract';

export class TipoInsulinaInvalidoError extends ErrorAbstract {
  constructor(value: string) {
    super(`Tipo de insulina inválido: ${value}. Debe ser RAPIDA o LENTA`, {
      code: 'INVALID_INSULIN_TYPE',
      field: 'tipo',
    });
  }
}