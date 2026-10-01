import { ErrorAbstract } from "../../../shared/error-abstract";

export class CorrectionSchemaInvalidError extends ErrorAbstract {
  constructor(message: string = 'El esquema de corrección no es válido') {
    super(message);
  }
}
