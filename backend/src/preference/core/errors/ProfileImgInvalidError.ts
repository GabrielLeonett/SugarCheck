import { ErrorAbstract } from "../../../shared/error-abstract";

export class ProfileImgInvalidError extends ErrorAbstract {
  constructor(message: string = 'El factor de sensibilidad no es válido') {
    super(message);
  }
}