import { ErrorAbstract } from '../../../shared/error-abstract';

export class ResetTokenExpiredError extends ErrorAbstract {
  constructor(message: string = 'El token de recuperación ha expirado. Solicita uno nuevo') {
    super(message, { code: 'RESET_TOKEN_EXPIRED' });
  }
}
