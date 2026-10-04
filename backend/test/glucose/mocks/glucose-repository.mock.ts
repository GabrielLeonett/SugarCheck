import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Glucose } from '../../../src/glucose/core/Glucose';
import { GlucoseRepository } from '../../../src/glucose/core/GlucoseRepository';
import { GlucoseId } from '../../../src/glucose/core/value-objects/GlucoseId';
import { UserId } from '../../../src/shared/core/value-objects/UserId';
import { GlucoseNotFoundError } from '../../../src/glucose/core/errors/GlucoseNotFoundError';

export class InMemoryGlucoseRepository implements GlucoseRepository {
  public items: Glucose[] = [];

  async getAllByUserId(
    userId: UserId,
  ): Promise<Result<Glucose[], ErrorAbstract>> {
    return Result.ok(this.items.filter((g) => g.userId.value === userId.value));
  }

  async getOneById(id: GlucoseId): Promise<Result<Glucose, ErrorAbstract>> {
    const found = this.items.find((g) => g.id.value === id.value);
    if (!found) {
      return Result.fail(
        new GlucoseNotFoundError(
          `Registro de glucosa con ID ${id.value} no encontrado`,
        ),
      );
    }
    return Result.ok(found);
  }

  async save(glucose: Glucose): Promise<Result<Glucose, ErrorAbstract>> {
    this.items.push(glucose);
    return Result.ok(glucose);
  }

  async update(
    id: GlucoseId,
    update: Partial<Glucose>,
  ): Promise<Result<Glucose, ErrorAbstract>> {
    const index = this.items.findIndex((g) => g.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new GlucoseNotFoundError(
          `Registro de glucosa con ID ${id.value} no encontrado`,
        ),
      );
    }
    const existing = this.items[index];
    const updated = new Glucose({
      id: existing.id,
      userId: existing.userId,
      valueMgdl: update.valueMgdl ?? existing.valueMgdl,
      mealTag: update.mealTag ?? existing.mealTag,
      date: existing.date,
      time: existing.time,
      createdAt: existing.createdAt,
    });
    this.items[index] = updated;
    return Result.ok(updated);
  }

  async delete(id: GlucoseId): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((g) => g.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new GlucoseNotFoundError(
          `Registro de glucosa con ID ${id.value} no encontrado`,
        ),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  public clear(): void {
    this.items = [];
  }
}
