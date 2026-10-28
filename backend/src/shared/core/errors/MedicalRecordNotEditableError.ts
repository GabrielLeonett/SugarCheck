import { ErrorAbstract } from '../../error-abstract';

/**
 * Se lanza cuando se intenta modificar o eliminar un registro médico que ya
 * superó la ventana de edición de 15 días desde su creación.
 */
export class MedicalRecordNotEditableError extends ErrorAbstract {
  constructor(
    message: string = 'No se puede modificar ni eliminar un registro médico después de 15 días desde su creación',
  ) {
    super(message, {
      code: 'MEDICAL_RECORD_EDIT_WINDOW_EXPIRED',
      field: 'id',
      origin: 'domain',
    });
  }
}
