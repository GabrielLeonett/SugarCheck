import { Result } from '../../../shared/result';
import { ContactPhoneInvalidError } from '../errors/ContactPhoneInvalidError';

const PHONE_PATTERN = /^\+?\d{7,15}$/;

/**
 * Teléfono de contacto de emergencia.
 * Es opcional: un valor vacío o nulo se interpreta como "sin teléfono".
 * Acepta dígitos, un prefijo internacional opcional (+) y separadores
 * habituales (espacios, guiones y paréntesis).
 */
export class ContactPhone {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(
    value?: string | null,
  ): Result<ContactPhone | undefined, ContactPhoneInvalidError> {
    if (value === undefined || value === null) return Result.ok(undefined);

    const trimmed = value.trim();
    if (trimmed.length === 0) return Result.ok(undefined);

    const normalized = trimmed.replace(/[\s()-]/g, '');
    if (!PHONE_PATTERN.test(normalized)) {
      return Result.fail(
        new ContactPhoneInvalidError(
          'El teléfono debe tener entre 7 y 15 dígitos',
        ).withCode('CONTACT_PHONE_INVALID', 'telefono'),
      );
    }

    return Result.ok(new ContactPhone(trimmed));
  }
}
