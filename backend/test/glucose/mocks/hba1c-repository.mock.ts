import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { HbA1c } from '../../../src/glucose/core/HbA1c';
import { HbA1cRepository } from '../../../src/glucose/core/HbA1cRepository';
import { HbA1cId } from '../../../src/glucose/core/value-objects/HbA1cId';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { HbA1cNotFoundError } from '../../../src/glucose/core/errors/HbA1cNotFoundError';

export class InMemoryHbA1cRepository implements HbA1cRepository {
  public items: HbA1c[] = [];

  async getAllByUserId(
    userId: UserId,
  ): Promise<Result<HbA1c[], ErrorAbstract>> {
    return Result.ok(this.items.filter((h) => h.userId.value === userId.value));
  }

  async getOneById(id: HbA1cId): Promise<Result<HbA1c, ErrorAbstract>> {
    const found = this.items.find((h) => h.id.value === id.value);
    if (!found) {
      return Result.fail(
        new HbA1cNotFoundError(`Examen HbA1c con ID ${id.value} no encontrado`),
      );
    }
    return Result.ok(found);
  }

  async save(hba1c: HbA1c): Promise<Result<HbA1c, ErrorAbstract>> {
    this.items.push(hba1c);
    return Result.ok(hba1c);
  }

  async update(
    id: HbA1cId,
    update: Partial<HbA1c>,
  ): Promise<Result<HbA1c, ErrorAbstract>> {
    const index = this.items.findIndex((h) => h.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new HbA1cNotFoundError(`Examen HbA1c con ID ${id.value} no encontrado`),
      );
    }
    const existing = this.items[index];
    const updated = new HbA1c({
      id: existing.id,
      userId: existing.userId,
      valuePercent: update.valuePercent ?? existing.valuePercent,
      examDate: existing.examDate,
      createdAt: existing.createdAt,
    });
    this.items[index] = updated;
    return Result.ok(updated);
  }

  async delete(id: HbA1cId): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((h) => h.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new HbA1cNotFoundError(`Examen HbA1c con ID ${id.value} no encontrado`),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  public clear(): void {
    this.items = [];
  }
}
