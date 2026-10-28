import { faker } from '@faker-js/faker';
import { ContactEmergence } from '../../../src/contact_emergence/core/ContactEmergence';
import { ContactEmergenceId } from '../../../src/contact_emergence/core/value-objects/ContactEmergenceId';
import { ContactName } from '../../../src/contact_emergence/core/value-objects/ContactName';
import { ContactParentesco } from '../../../src/contact_emergence/core/value-objects/ContactParentesco';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

export const VALID_PARENTESCOS = [
  'madre',
  'padre',
  'hermano',
  'hermana',
  'abuelo',
  'abuela',
  'tio',
  'tia',
  'tutor',
  'otro',
] as const;

interface ContactOverrides {
  id?: string;
  userId?: string;
  name?: string;
  parentesco?: string;
  telefono?: string;
}

export class ContactEmergenceFactory {
  static createInstance(overrides: ContactOverrides = {}): ContactEmergence {
    return new ContactEmergence({
      id: ContactEmergenceId.create(
        overrides.id ?? faker.string.uuid(),
      ).getValue(),
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      name: ContactName.create(overrides.name ?? 'Mamá Test').getValue(),
      parentesco: ContactParentesco.create(
        overrides.parentesco ?? VALID_PARENTESCOS[0],
      ).getValue(),
      telefono: overrides.telefono ?? '+57 300 000 0000',
    });
  }
}
