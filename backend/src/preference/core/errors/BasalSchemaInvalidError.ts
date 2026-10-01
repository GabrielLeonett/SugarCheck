import { ErrorAbstract } from "../../../shared/error-abstract";

export class BasalSchemaInvalidError extends ErrorAbstract {
  constructor(message: string = 'El esquema basal no es válido') {
    super(message);
  }
}
