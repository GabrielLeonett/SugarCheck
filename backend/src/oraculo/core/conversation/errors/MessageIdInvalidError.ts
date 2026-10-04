import { ErrorAbstract } from '../../../../shared/error-abstract';

export class MessageIdInvalidError extends ErrorAbstract {
  constructor(message: string = 'El ID del mensaje no es válido') {
    super(message, { code: 'MESSAGE_ID_INVALID' });
  }
}
