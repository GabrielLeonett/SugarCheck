import { ErrorAbstract } from '../../../../shared/error-abstract';

export class EmptyMessageError extends ErrorAbstract {
  constructor(message: string = 'El mensaje no puede estar vacío') {
    super(message, { code: 'EMPTY_MESSAGE' });
  }
}
