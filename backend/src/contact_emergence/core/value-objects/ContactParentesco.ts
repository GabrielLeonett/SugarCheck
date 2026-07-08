import { Result } from '../../../shared/result';
import { ContactParentescoInvalidError } from '../errors/ContactParentescoInvalidError';
import { Parentesco } from '../../../shared/enums/parentesco.enum';

export class ContactParentesco {
  public readonly value: Parentesco;
  private constructor(value: Parentesco) {
    this.value = value;
  }

  public static create(value: string): Result<ContactParentesco, ContactParentescoInvalidError> {
    const validValues = Object.values(Parentesco) as string[];
    if (!validValues.includes(value)) {
      return Result.fail(
        new ContactParentescoInvalidError(
          `El parentesco debe ser uno de: ${validValues.join(', ')}`,
        ),
      );
    }
    return Result.ok(new ContactParentesco(value as Parentesco));
  }
}
