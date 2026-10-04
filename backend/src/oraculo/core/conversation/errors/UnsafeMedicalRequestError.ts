import { ErrorAbstract } from '../../../../shared/error-abstract';

export class UnsafeMedicalRequestError extends ErrorAbstract {
  constructor(
    message: string = 'No puedo darte consejos sobre dosis de insulina o medicamentos. Consulta a tu médico.',
  ) {
    super(message, { code: 'UNSAFE_MEDICAL_REQUEST' });
  }
}
