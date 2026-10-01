import { ErrorAbstract } from '../../../../shared/error-abstract';

export class MessageRoleInvalidError extends ErrorAbstract {
  constructor(message: string = 'El rol del mensaje no es válido') {
    super(message, { code: 'MESSAGE_ROLE_INVALID' });
  }
}
