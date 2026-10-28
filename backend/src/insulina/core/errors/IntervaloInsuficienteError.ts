import { ErrorAbstract } from '../../../shared/error-abstract';

export class IntervaloInsuficienteError extends ErrorAbstract {
  constructor() {
    super('Deben pasar al menos 2 horas desde la última inyección de insulina', {
      code: 'INSULIN_INTERVAL_TOO_SHORT',
      field: 'hora',
    });
  }
}
