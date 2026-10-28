import { IdInsulina } from '../core/value-objects/IdInsulina';
import { InsulinaNotFoundError } from '../core/errors/InsulinaNotFoundError';
import { InsulinaRepository } from '../core/InsulinaRepository';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { isWithinMedicalRecordEditWindow } from '../../shared/core/MedicalRecordEditWindow';
import { MedicalRecordNotEditableError } from '../../shared/core/errors/MedicalRecordNotEditableError';

export class DeleteInsulina {
  constructor(
    private readonly repository: InsulinaRepository,
  ) {}

  public async run(params: { id: string }): Promise<Result<void, ErrorAbstract>> {
    const idRes = IdInsulina.create(params.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const existingResult = await this.repository.getById(idRes.getValue());
    if (!existingResult.isValid) return Result.fail(existingResult.getError());

    const existing = existingResult.getValue();
    if (!existing) {
      return Result.fail(new InsulinaNotFoundError(params.id));
    }

    if (!isWithinMedicalRecordEditWindow(existing.createdAt)) {
      return Result.fail(
        new MedicalRecordNotEditableError(
          'No se puede eliminar un registro de insulina después de 15 días desde su creación.',
        ),
      );
    }

    return await this.repository.delete(idRes.getValue());
  }
}
