import { ErrorAbstract } from '../../../shared/error-abstract';

export class ResetTokenInvalidError extends ErrorAbstract {
  constructor(message: string = 'El token de recuperación no es válido') {
    super(message, { code: 'RESET_TOKEN_INVALID' });
  }
}
