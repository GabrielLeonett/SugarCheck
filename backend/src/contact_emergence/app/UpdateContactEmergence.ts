import { ContactEmergenceRepository } from '../core/ContactEmergenceRepository';
import { ContactEmergence } from '../core/ContactEmergence';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { ContactEmergenceId } from '../core/value-objects/ContactEmergenceId';
import { ContactName } from '../core/value-objects/ContactName';
import { ContactParentesco } from '../core/value-objects/ContactParentesco';
import { ContactPhone } from '../core/value-objects/ContactPhone';

export class UpdateContactEmergence {
  constructor(
    private readonly repository: ContactEmergenceRepository,
  ) {}

  async run(id: string, update: {
    name?: string;
    parentesco?: string;
    telefono?: string;
  }): Promise<Result<ContactEmergence, ErrorAbstract>> {
    const idRes = ContactEmergenceId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const contactId = idRes.getValue();

    const validatedUpdate: any = {};

    if (update.name !== undefined) {
      const nameRes = ContactName.create(update.name);
      if (!nameRes.isValid) return Result.fail(nameRes.getError());
      validatedUpdate.name = nameRes.getValue();
    }

    if (update.parentesco !== undefined) {
      const parentescoRes = ContactParentesco.create(update.parentesco);
      if (!parentescoRes.isValid) return Result.fail(parentescoRes.getError());
      validatedUpdate.parentesco = parentescoRes.getValue();
    }

    if (update.telefono !== undefined) {
      const phoneRes = ContactPhone.create(update.telefono);
      if (!phoneRes.isValid) return Result.fail(phoneRes.getError());
      validatedUpdate.telefono = phoneRes.getValue()?.value;
    }

    return await this.repository.update(contactId, validatedUpdate);
  }
}
