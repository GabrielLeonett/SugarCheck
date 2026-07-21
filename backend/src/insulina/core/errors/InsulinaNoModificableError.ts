import { ErrorAbstract } from '../../../shared/error-abstract';

export class InsulinaNoModificableError extends ErrorAbstract {
  constructor(diasTranscurridos: number) {
    super(
      `No se puede modificar un registro de insulina después de 15 días. Han transcurrido ${diasTranscurridos} días desde su creación.`,
      {
        code: 'INSULINA_NOT_MODIFIABLE',
        field: 'id',
      },
    );
  }
}