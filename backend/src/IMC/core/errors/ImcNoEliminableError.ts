import { ErrorAbstract } from '../../../shared/error-abstract';

export class ImcNoEliminableError extends ErrorAbstract {
  constructor() {
    super('No se puede eliminar un registro de IMC. Los registros no pueden eliminarse.', {
      code: 'IMC_NOT_DELETABLE',
      field: 'id',
    });
  }
}
