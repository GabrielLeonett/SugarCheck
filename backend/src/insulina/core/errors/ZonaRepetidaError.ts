import { ErrorAbstract } from '../../../shared/error-abstract';

export class ZonaRepetidaError extends ErrorAbstract {
  constructor() {
    super('No puedes aplicar insulina en la misma zona que la última inyección', {
      code: 'INSULIN_ZONE_REPEATED',
      field: 'zona',
    });
  }
}
