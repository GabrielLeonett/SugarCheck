import { ContactEmergence } from '../core/ContactEmergence';
import { ContactEmergenceRepository } from '../core/ContactEmergenceRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { ContactEmergenceId } from '../core/value-objects/ContactEmergenceId';
import { ContactName } from '../core/value-objects/ContactName';
import { ContactParentesco } from '../core/value-objects/ContactParentesco';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';

export class SaveContactEmergence {
  constructor(
    private readonly repository: ContactEmergenceRepository,
    private readonly generateUUID: GenerateUUIDInterface,
  ) {}

  public async run(data: {
    userId: string;
    name: string;
    parentesco: string;
    telefono?: string;
  }): Promise<Result<ContactEmergence, ErrorAbstract>> {
    const id = this.generateUUID.run();
    const idRes = ContactEmergenceId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const nameRes = ContactName.create(data.name);
    if (!nameRes.isValid) return Result.fail(nameRes.getError());

    const parentescoRes = ContactParentesco.create(data.parentesco);
    if (!parentescoRes.isValid) return Result.fail(parentescoRes.getError());

    const contact = new ContactEmergence({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      name: nameRes.getValue(),
      parentesco: parentescoRes.getValue(),
      telefono: data.telefono,
    });

    return await this.repository.save(contact);
  }
}
