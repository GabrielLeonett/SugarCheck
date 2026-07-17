import { Imc } from '../core/Imc';
import { ImcRepository } from '../core/ImcRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { Id_IMC } from '../core/value-objects/Id_IMC';
import { Peso } from '../core/value-objects/peso';
import { Altura } from '../core/value-objects/altura';
import { Fecha } from '../core/value-objects/Fecha';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';

export class CreateImc {
  constructor(
    private readonly repository: ImcRepository,
    private readonly generateUUID: GenerateUUIDInterface,
  ) {}

  public async run(data: {
    userId: string;
    peso: number;
    altura: number;
    dia: number;
    mes: number;
    anio: number;
  }): Promise<Result<Imc, ErrorAbstract>> {
    const id = this.generateUUID.run();
    const idRes = Id_IMC.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const pesoRes = Peso.create(data.peso);
    if (!pesoRes.isValid) return Result.fail(pesoRes.getError());

    const alturaRes = Altura.create(data.altura);
    if (!alturaRes.isValid) return Result.fail(alturaRes.getError());

    const fechaRes = Fecha.crear(data.dia, data.mes, data.anio);
    if (!fechaRes.isValid) return Result.fail(fechaRes.getError());

    const imc = new Imc({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      peso: pesoRes.getValue(),
      altura: alturaRes.getValue(),
      fecha: fechaRes.getValue(),
    });

    return await this.repository.save(imc);
  }
}
