import { ImcRepository } from '../core/ImcRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Id_IMC } from '../core/value-objects/Id_IMC';
import { isWithinMedicalRecordEditWindow } from '../../shared/core/MedicalRecordEditWindow';
import { MedicalRecordNotEditableError } from '../../shared/core/errors/MedicalRecordNotEditableError';

export class DeleteImc {
  constructor(
    private readonly repository: ImcRepository,
  ) {}

  public async run(data: { id: string }): Promise<Result<void, ErrorAbstract>> {
    const idRes = Id_IMC.create(data.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const existingResult = await this.repository.getOneById(idRes.getValue());
    if (!existingResult.isValid) return Result.fail(existingResult.getError());

    const existing = existingResult.getValue();
    if (!isWithinMedicalRecordEditWindow(existing.createdAt)) {
      return Result.fail(
        new MedicalRecordNotEditableError(
          'El período de edición de 15 días ha expirado para este registro de IMC',
        ),
      );
    }

    return await this.repository.delete(idRes.getValue());
  }
}
