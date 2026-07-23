import { Result } from '../../../shared/result';
import { ContactNameInvalidError } from '../errors/ContactNameInvalidError';

export class ContactEmergenceId {
  public readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<ContactEmergenceId, ContactNameInvalidError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new ContactNameInvalidError('El ID del contacto no puede estar vacío').withCode('CONTACT_ID_EMPTY', 'id'),
      );
    }
    return Result.ok(new ContactEmergenceId(value.trim()));
  }
}
