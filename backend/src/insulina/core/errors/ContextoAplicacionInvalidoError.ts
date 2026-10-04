import { ErrorAbstract } from '../../../shared/error-abstract';

export class ContextoAplicacionInvalidoError extends ErrorAbstract {
  constructor(message: string) {
    super(message, {
      code: 'INVALID_CONTEXT',
      field: 'contexto',
    });
  }
}