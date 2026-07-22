import { ErrorAbstract } from '../../../shared/error-abstract';

export class InsulinaNoEliminableError extends ErrorAbstract {
  constructor() {
    super('No se puede eliminar un registro de insulina. Los registros de insulina son inmutables una vez creados.', {
      code: 'INSULINA_NOT_DELETABLE',
      field: 'id',
    });
  }
}