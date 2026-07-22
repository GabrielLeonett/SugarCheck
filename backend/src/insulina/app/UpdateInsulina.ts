import { Insulina } from '../core/Insulina';
import { InsulinaRepository } from '../core/InsulinaRepository';
import { IdInsulina } from '../core/value-objects/IdInsulina';
import { Dosis } from '../core/value-objects/Dosis';
import { ZonaInyeccion } from '../core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../core/value-objects/ContextoAplicacion';
import { FechaInsulina } from '../core/value-objects/FechaInsulina';
import { HoraInsulina } from '../core/value-objects/HoraInsulina';
import { InsulinaNotFoundError } from '../core/errors/InsulinaNotFoundError';
import { InsulinaNoModificableError } from '../core/errors/InsulinaNoModificableError';
import { ContextoAplicacionInvalidoError } from '../core/errors/ContextoAplicacionInvalidoError';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

const DIAS_MODIFICACION = 15;

export class UpdateInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(params: {
    id: string;
    dosis?: number;
    dia?: number;
    mes?: number;
    anio?: number;
    hora?: string;
    zona?: string;
    contexto?: string | null;
  }): Promise<Result<Insulina, ErrorAbstract>> {
    const idRes = IdInsulina.create(params.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const existingRes = await this.repository.getById(idRes.getValue());
    if (!existingRes.isValid) return Result.fail(existingRes.getError());

    const existing = existingRes.getValue();
    if (!existing) {
      return Result.fail(new InsulinaNotFoundError(params.id));
    }

    const ahora = new Date();
    const diasTranscurridos = Math.floor(
      (ahora.getTime() - existing.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diasTranscurridos > DIAS_MODIFICACION) {
      return Result.fail(new InsulinaNoModificableError(diasTranscurridos));
    }

    if (params.dosis !== undefined) {
      const dosisRes = Dosis.create(params.dosis);
      if (!dosisRes.isValid) return Result.fail(dosisRes.getError());
      existing.actualizarDosis(dosisRes.getValue());
    }

    if (params.dia !== undefined && params.mes !== undefined && params.anio !== undefined) {
      const fechaRes = FechaInsulina.create(params.dia, params.mes, params.anio);
      if (!fechaRes.isValid) return Result.fail(fechaRes.getError());
      existing.actualizarFecha(fechaRes.getValue());
    }

    if (params.hora !== undefined) {
      const horaRes = HoraInsulina.create(params.hora);
      if (!horaRes.isValid) return Result.fail(horaRes.getError());
      existing.actualizarHora(horaRes.getValue());
    }

    if (params.zona !== undefined) {
      const zonaRes = ZonaInyeccion.create(params.zona);
      if (!zonaRes.isValid) return Result.fail(zonaRes.getError());
      existing.actualizarZona(zonaRes.getValue());
    }

    if (params.contexto !== undefined) {
      if (params.contexto === null || params.contexto === '') {
        if (existing.tipo.isRapida()) {
          return Result.fail(new ContextoAplicacionInvalidoError('La insulina rápida requiere un contexto de aplicación'));
        }
        existing.actualizarContexto(null);
      } else {
        const ctxRes = ContextoAplicacion.create(params.contexto);
        if (!ctxRes.isValid) return Result.fail(ctxRes.getError());
        existing.actualizarContexto(ctxRes.getValue());
      }
    }

    return this.repository.update(idRes.getValue(), existing);
  }
}