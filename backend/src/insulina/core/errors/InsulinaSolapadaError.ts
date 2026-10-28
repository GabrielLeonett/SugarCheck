import { ErrorAbstract } from '../../../shared/error-abstract';

export class InsulinaSolapadaError extends ErrorAbstract {
  constructor() {
    super('Ya registraste una dosis de insulina de este tipo a la misma fecha y hora', {
      code: 'INSULIN_OVERLAP',
      field: 'hora',
    });
  }
}
