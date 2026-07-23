import { ErrorAbstract } from '../../../shared/error-abstract';

export class InsulinaNotFoundError extends ErrorAbstract {
  constructor(id: string) {
    super(`Registro de insulina con ID ${id} no encontrado`, {
      code: 'INSULINA_NOT_FOUND',
      field: 'id',
    });
  }
}