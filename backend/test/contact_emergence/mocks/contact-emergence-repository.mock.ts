import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { ContactEmergence } from '../../../src/contact_emergence/core/ContactEmergence';
import { ContactEmergenceRepository } from '../../../src/contact_emergence/core/ContactEmergenceRepository';
import { ContactEmergenceId } from '../../../src/contact_emergence/core/value-objects/ContactEmergenceId';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { ContactNotFoundError } from '../../../src/contact_emergence/core/errors/ContactNotFoundError';

export class InMemoryContactEmergenceRepository implements ContactEmergenceRepository {
  public items: ContactEmergence[] = [];

  async getAllByUserId(
    userId: UserId,
  ): Promise<Result<ContactEmergence[], ErrorAbstract>> {
    return Result.ok(this.items.filter((c) => c.userId.value === userId.value));
  }

  async getOneById(
    id: ContactEmergenceId,
  ): Promise<Result<ContactEmergence, ErrorAbstract>> {
    const found = this.items.find((c) => c.id.value === id.value);
    if (!found) {
      return Result.fail(
        new ContactNotFoundError(`Contacto con ID ${id.value} no encontrado`),
      );
    }
    return Result.ok(found);
  }

  async save(
    contact: ContactEmergence,
  ): Promise<Result<ContactEmergence, ErrorAbstract>> {
    this.items.push(contact);
    return Result.ok(contact);
  }

  async update(
    id: ContactEmergenceId,
    update: Partial<ContactEmergence>,
  ): Promise<Result<ContactEmergence, ErrorAbstract>> {
    const index = this.items.findIndex((c) => c.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new ContactNotFoundError(`Contacto con ID ${id.value} no encontrado`),
      );
    }
    const existing = this.items[index];
    const updated = new ContactEmergence({
      id: existing.id,
      userId: existing.userId,
      name:
        (update.name as unknown as ContactEmergence['name']) ?? existing.name,
      parentesco:
        (update.parentesco as unknown as ContactEmergence['parentesco']) ??
        existing.parentesco,
      telefono:
        update.telefono !== undefined ? update.telefono : existing.telefono,
    });
    this.items[index] = updated;
    return Result.ok(updated);
  }

  async delete(id: ContactEmergenceId): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((c) => c.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new ContactNotFoundError(`Contacto con ID ${id.value} no encontrado`),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  public clear(): void {
    this.items = [];
  }
}
