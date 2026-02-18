import { ErrorAbstract } from "../../../shared/error-abstract";

// 1. Error específico para el Email
export class UserEmailInvalidError extends ErrorAbstract {
  constructor(
    message: string = 'El formato del correo electrónico no es válido',
  ) {
    super(message);
  }
}
