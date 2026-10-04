import { ErrorAbstract } from '../../../shared/error-abstract';

export class DrasticWeightChangeError extends ErrorAbstract {
  constructor(
    message: string = 'El cambio de peso no puede ser tan brusco de un día para otro',
  ) {
    super(message);
  }
}
