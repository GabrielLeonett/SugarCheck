import { ImcRepository } from '../core/ImcRepository';
import { Imc } from '../core/Imc';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Id_IMC } from '../core/value-objects/Id_IMC';
import { Peso } from '../core/value-objects/peso';
import { Altura } from '../core/value-objects/altura';
import { Fecha } from '../core/value-objects/Fecha';
import { FechaInvalidaError } from '../core/errors/FechaInvalidError';
import { ImcNoModificableError } from '../core/errors/ImcNoModificableError';

const EDIT_WINDOW_DAYS = 15;

export class UpdateImc {
  constructor(
    private readonly repository: ImcRepository,
  ) {}

  async run(id: string, update: {
    peso?: number;
    altura?: number;
    dia?: number;
    mes?: number;
    anio?: number;
  }): Promise<Result<Imc, ErrorAbstract>> {
    const idRes = Id_IMC.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const imcId = idRes.getValue();

    const existingResult = await this.repository.getOneById(imcId);
    if (!existingResult.isValid) return existingResult;

    const existing = existingResult.getValue();
    const diffDays = (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > EDIT_WINDOW_DAYS) {
      return Result.fail(new ImcNoModificableError());
    }

    const validatedUpdate: any = {};

    if (update.peso !== undefined) {
      const pesoRes = Peso.create(update.peso);
      if (!pesoRes.isValid) return Result.fail(pesoRes.getError());
      validatedUpdate.peso = pesoRes.getValue();
    }

    if (update.altura !== undefined) {
      const alturaRes = Altura.create(update.altura);
      if (!alturaRes.isValid) return Result.fail(alturaRes.getError());
      validatedUpdate.altura = alturaRes.getValue();
    }

    if (update.dia !== undefined && update.mes !== undefined && update.anio !== undefined) {
      const fechaRes = Fecha.crear(update.dia, update.mes, update.anio);
      if (!fechaRes.isValid) return Result.fail(fechaRes.getError());

      const now = new Date();
      const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (fechaRes.getValue().valor > hoy) {
        return Result.fail(
          new FechaInvalidaError('La fecha no puede ser posterior al día de hoy'),
        );
      }
      validatedUpdate.fecha = fechaRes.getValue();
    }

    return await this.repository.update(imcId, validatedUpdate);
  }
}
