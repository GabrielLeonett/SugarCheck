import { ImcRepository } from '../core/ImcRepository';
import { Imc } from '../core/Imc';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Id_IMC } from '../core/value-objects/Id_IMC';
import { Peso } from '../core/value-objects/peso';
import { Altura } from '../core/value-objects/altura';

export class UpdateImc {
  constructor(
    private readonly repository: ImcRepository,
  ) {}

  async run(id: string, update: {
    peso?: number;
    altura?: number;
  }): Promise<Result<Imc, ErrorAbstract>> {
    const idRes = Id_IMC.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());
    const imcId = idRes.getValue();

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

    return await this.repository.update(imcId, validatedUpdate);
  }
}
