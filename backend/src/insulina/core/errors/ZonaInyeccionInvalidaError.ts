import { ErrorAbstract } from '../../../shared/error-abstract';

export class ZonaInyeccionInvalidaError extends ErrorAbstract {
  constructor(value: string) {
    super(`Zona de inyección inválida: ${value}`, {
      code: 'INVALID_INJECTION_ZONE',
      field: 'zona',
    });
  }
}