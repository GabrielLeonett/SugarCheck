import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Imc } from '../../../src/IMC/core/Imc';
import { ImcRepository } from '../../../src/IMC/core/ImcRepository';
import { Id_IMC } from '../../../src/IMC/core/value-objects/Id_IMC';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { ImcNotFoundError } from '../../../src/IMC/core/errors/ImcNotFoundError';

export class InMemoryImcRepository implements ImcRepository {
  public items: Imc[] = [];

  async getAllByUserId(userId: UserId): Promise<Result<Imc[], ErrorAbstract>> {
    return Result.ok(this.items.filter((i) => i.userId.value === userId.value));
  }

  async getOneById(id: Id_IMC): Promise<Result<Imc, ErrorAbstract>> {
    const found = this.items.find((i) => i.id.value === id.value);
    if (!found) {
      return Result.fail(
        new ImcNotFoundError(`Registro IMC con ID ${id.value} no encontrado`),
      );
    }
    return Result.ok(found);
  }

  async save(imc: Imc): Promise<Result<Imc, ErrorAbstract>> {
    this.items.push(imc);
    return Result.ok(imc);
  }

  async update(
    id: Id_IMC,
    update: Partial<Imc>,
  ): Promise<Result<Imc, ErrorAbstract>> {
    const index = this.items.findIndex((i) => i.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new ImcNotFoundError(`Registro IMC con ID ${id.value} no encontrado`),
      );
    }
    const existing = this.items[index];
    const updated = new Imc({
      id: existing.id,
      userId: existing.userId,
      peso: (update.peso as unknown as Imc['peso']) ?? existing.peso,
      altura: (update.altura as unknown as Imc['altura']) ?? existing.altura,
      fecha: existing.fecha,
    });
    this.items[index] = updated;
    return Result.ok(updated);
  }

  async delete(id: Id_IMC): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((i) => i.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new ImcNotFoundError(`Registro IMC con ID ${id.value} no encontrado`),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  public clear(): void {
    this.items = [];
  }
}
