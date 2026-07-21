import { ErrorAbstract } from '../../../shared/error-abstract';

export class EditWindowExpiredError extends ErrorAbstract {
  constructor(message: string = 'El período de edición de 15 días ha expirado') {
    super(message, { code: 'EDIT_WINDOW_EXPIRED', origin: 'domain' });
  }
}
