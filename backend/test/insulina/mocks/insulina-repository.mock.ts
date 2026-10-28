import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { Insulina } from '../../../src/insulina/core/Insulina';
import { InsulinaRepository } from '../../../src/insulina/core/InsulinaRepository';
import { IdInsulina } from '../../../src/insulina/core/value-objects/IdInsulina';
import { TipoInsulina } from '../../../src/insulina/core/value-objects/TipoInsulina';
import { Dosis } from '../../../src/insulina/core/value-objects/Dosis';
import { FechaInsulina } from '../../../src/insulina/core/value-objects/FechaInsulina';
import { HoraInsulina } from '../../../src/insulina/core/value-objects/HoraInsulina';
import { ZonaInyeccion } from '../../../src/insulina/core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../../../src/insulina/core/value-objects/ContextoAplicacion';

export class InMemoryInsulinaRepository implements InsulinaRepository {
  public items: Insulina[] = [];
  public totalsResponse: { totalRapida: number; totalLenta: number } | null =
    null;

  async getAllByUserId(
    userId: string,
  ): Promise<Result<Insulina[], ErrorAbstract>> {
    return Result.ok(this.items.filter((i) => i.userId === userId));
  }

  async getById(
    id: IdInsulina,
  ): Promise<Result<Insulina | null, ErrorAbstract>> {
    const found = this.items.find((i) => i.id.value === id.value) ?? null;
    return Result.ok(found);
  }

  async save(insulina: Insulina): Promise<Result<Insulina, ErrorAbstract>> {
    this.items.push(insulina);
    return Result.ok(insulina);
  }

  async update(
    id: IdInsulina,
    data: Partial<Insulina>,
  ): Promise<Result<Insulina, ErrorAbstract>> {
    const index = this.items.findIndex((i) => i.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new Error('No se pudo actualizar: el registro de insulina no existe'),
      );
    }
    const existing = this.items[index];
    const updated = new Insulina({
      id: existing.id,
      userId: existing.userId,
      tipo: (data.tipo as unknown as TipoInsulina) ?? existing.tipo,
      dosis: (data.dosis as unknown as Dosis) ?? existing.dosis,
      fecha: (data.fecha as unknown as FechaInsulina) ?? existing.fecha,
      hora: (data.hora as unknown as HoraInsulina) ?? existing.hora,
      zona: (data.zona as unknown as ZonaInyeccion) ?? existing.zona,
      contexto:
        data.contexto !== undefined
          ? ((data.contexto as unknown as ContextoAplicacion) ?? null)
          : existing.contexto,
      createdAt: existing.createdAt,
    });
    this.items[index] = updated;
    return Result.ok(updated);
  }

  async delete(id: IdInsulina): Promise<Result<void, ErrorAbstract>> {
    const index = this.items.findIndex((i) => i.id.value === id.value);
    if (index === -1) {
      return Result.fail(
        new Error('No se pudo eliminar: el registro de insulina no existe'),
      );
    }
    this.items.splice(index, 1);
    return Result.ok(undefined);
  }

  async getByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Result<Insulina[], ErrorAbstract>> {
    return Result.ok(
      this.items.filter((i) => {
        const d = i.fecha.value;
        return i.userId === userId && d >= startDate && d <= endDate;
      }),
    );
  }

  async getTotalByUserIdAndDate(
    _userId: string,
    _date: Date,
  ): Promise<
    Result<{ totalRapida: number; totalLenta: number }, ErrorAbstract>
  > {
    if (this.totalsResponse) return Result.ok(this.totalsResponse);
    let totalRapida = 0;
    let totalLenta = 0;
    for (const item of this.items) {
      if (item.tipo.toString() === 'RAPIDA') totalRapida += item.dosis.value;
      else totalLenta += item.dosis.value;
    }
    return Result.ok({ totalRapida, totalLenta });
  }

  public clear(): void {
    this.items = [];
    this.totalsResponse = null;
  }
}
