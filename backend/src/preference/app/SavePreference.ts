import { UserId } from '../../shared/core/value-objects/UserId';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { Preference } from '../core/Preference';
import { PreferenceRepository } from '../core/PreferenceRepository';
import { UnitMeasure } from '../core/value-objects/UnitMeasure';
import { InsulinRatios } from '../core/value-objects/InsulinRatios';
import { SensitivityFactor } from '../core/value-objects/SensitivityFactor';
import { Thresholds } from '../core/value-objects/Thresholds';
import { ProfileImg } from '../core/value-objects/ProfileImg';
import { CorrectionSchemas, type CorrectionSchemaItem } from '../core/value-objects/CorrectionSchemas';
import { BasalSchemas, type BasalSchemaItem } from '../core/value-objects/BasalSchemas';

export class SavePreference {
  constructor(private readonly repository: PreferenceRepository) {}

  async run(
    userId: string,
    profileImg: string,
    unitMeasure: string,
    thresholds: { hypo: number; hiper: number },
    insulinRatios: { breakfast: number; lunch: number; dinner: number },
    sensitivity: number,
    correctionSchemas?: CorrectionSchemaItem[],
    basalSchemas?: BasalSchemaItem[],
  ): Promise<Result<Preference, ErrorAbstract>> {
    
    // 1. Crear Value Objects
    const idRes = UserId.create(userId);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const profileImgRes = ProfileImg.create(profileImg);
    if (!profileImgRes.isValid) return Result.fail(profileImgRes.getError());

    const unitMeasureRes = UnitMeasure.create(unitMeasure);
    if (!unitMeasureRes.isValid) return Result.fail(unitMeasureRes.getError());

    const thresholdsRes = Thresholds.create({ ...thresholds });
    if (!thresholdsRes.isValid) return Result.fail(thresholdsRes.getError());

    const insulinRatiosRes = InsulinRatios.create(
      insulinRatios.breakfast,
      insulinRatios.lunch,
      insulinRatios.dinner,
    );
    if (!insulinRatiosRes.isValid) return Result.fail(insulinRatiosRes.getError());

    const sensitivityRes = SensitivityFactor.create(sensitivity);
    if (!sensitivityRes.isValid) return Result.fail(sensitivityRes.getError());

    const correctionSchemasRes = CorrectionSchemas.create(correctionSchemas);
    if (!correctionSchemasRes.isValid) return Result.fail(correctionSchemasRes.getError());

    const basalSchemasRes = BasalSchemas.create(basalSchemas);
    if (!basalSchemasRes.isValid) return Result.fail(basalSchemasRes.getError());

    // 2. Instanciar Entidad
    const preference = new Preference({
      userId: idRes.getValue(),
      profileImg: profileImgRes.getValue(),
      unitMeasure: unitMeasureRes.getValue(),
      thresholds: thresholdsRes.getValue(),
      insulinRatios: insulinRatiosRes.getValue(),
      sensitivity: sensitivityRes.getValue(),
      correctionSchemas: correctionSchemasRes.getValue(),
      basalSchemas: basalSchemasRes.getValue(),
    });

    // 3. Persistir
    return await this.repository.save(preference);
  }
}