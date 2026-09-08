import { ErrorAbstract } from './error-abstract';

// 1. Error para operaciones de base de datos
export class DatabaseError extends ErrorAbstract {
  constructor(message: string = 'Error en la base de datos', stack?: string) {
    super(message, { stack });
  }
}
