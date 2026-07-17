import { ErrorAbstract } from '../../../shared/error-abstract';

export class NotificationNotFoundError extends ErrorAbstract {
  constructor(message = 'Notificación no encontrada') {
    super(message);
  }
}
