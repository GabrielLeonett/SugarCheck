import { ErrorAbstract } from './error-abstract';

export class DatabaseError extends ErrorAbstract {
  constructor(message: string = 'Error interno del servidor', stack?: string) {
    super(message, { stack, origin: 'infrastructure', code: 'DATABASE_ERROR' });
  }
}
