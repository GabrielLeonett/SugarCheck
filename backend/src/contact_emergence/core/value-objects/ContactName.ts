import { Result } from '../../../shared/result';
import { ContactNameInvalidError } from '../errors/ContactNameInvalidError';

export class ContactName {
  public readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<ContactName, ContactNameInvalidError> {
    if (!value || value.trim().length < 3) {
      return Result.fail(
        new ContactNameInvalidError('El nombre debe tener al menos 3 caracteres'),
      );
    }
    if (value.length > 50) {
      return Result.fail(
        new ContactNameInvalidError('El nombre no puede exceder los 50 caracteres'),
      );
    }
    return Result.ok(new ContactName(value.trim()));
  }
}
