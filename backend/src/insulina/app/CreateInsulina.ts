import { Insulina } from '../core/Insulina';
import { InsulinaRepository } from '../core/InsulinaRepository';
import { IdInsulina } from '../core/value-objects/IdInsulina';
import { TipoInsulina } from '../core/value-objects/TipoInsulina';
import { Dosis } from '../core/value-objects/Dosis';
import { ZonaInyeccion } from '../core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../core/value-objects/ContextoAplicacion';
import { FechaInsulina } from '../core/value-objects/FechaInsulina';
import { HoraInsulina } from '../core/value-objects/HoraInsulina';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';
import { ContextoAplicacionInvalidoError } from '../core/errors/ContextoAplicacionInvalidoError';

export class CreateInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
    private readonly generateUUID: GenerateUUIDInterface,
  ) {}

  public async run(params: {
    userId: string;
    tipo: string;
    dosis: number;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
    contexto?: string;
  }): Promise<Result<Insulina, ErrorAbstract>> {
    const id = IdInsulina.generate(this.generateUUID);
    const userId = params.userId;

    const tipoRes = TipoInsulina.create(params.tipo);
    if (!tipoRes.isValid) return Result.fail(tipoRes.getError());

    const dosisRes = Dosis.create(params.dosis);
    if (!dosisRes.isValid) return Result.fail(dosisRes.getError());

    const fechaRes = FechaInsulina.create(params.dia, params.mes, params.anio);
    if (!fechaRes.isValid) return Result.fail(fechaRes.getError());

    const horaRes = HoraInsulina.create(params.hora);
    if (!horaRes.isValid) return Result.fail(horaRes.getError());

    const zonaRes = ZonaInyeccion.create(params.zona);
    if (!zonaRes.isValid) return Result.fail(zonaRes.getError());

    let contexto: ContextoAplicacion | null = null;
    if (tipoRes.getValue().isRapida()) {
      if (!params.contexto) {
        return Result.fail(new ContextoAplicacionInvalidoError('El contexto es obligatorio para insulina rápida'));
      }
      const ctxRes = ContextoAplicacion.create(params.contexto);
      if (!ctxRes.isValid) return Result.fail(ctxRes.getError());
      contexto = ctxRes.getValue();
    }

    const insulina = new Insulina({
      id,
      userId,
      tipo: tipoRes.getValue(),
      dosis: dosisRes.getValue(),
      fecha: fechaRes.getValue(),
      hora: horaRes.getValue(),
      zona: zonaRes.getValue(),
      contexto,
    });

    return this.repository.save(insulina);
  }
}