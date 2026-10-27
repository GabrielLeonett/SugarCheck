import { ErrorAbstract } from '../../../shared/error-abstract';

export class ImcNoModificableError extends ErrorAbstract {
  constructor() {
    super(
      'No se puede modificar un registro de IMC después de 15 días desde su creación.',
      {
        code: 'IMC_NOT_MODIFIABLE',
        field: 'id',
      },
    );
  }
}
