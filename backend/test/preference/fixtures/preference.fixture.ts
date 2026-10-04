import { faker } from '@faker-js/faker';
import { Preference } from '../../../src/preference/core/Preference';
import { ProfileImg } from '../../../src/preference/core/value-objects/ProfileImg';
import { UnitMeasure } from '../../../src/preference/core/value-objects/UnitMeasure';
import { Thresholds } from '../../../src/preference/core/value-objects/Thresholds';
import { InsulinRatios } from '../../../src/preference/core/value-objects/InsulinRatios';
import { SensitivityFactor } from '../../../src/preference/core/value-objects/SensitivityFactor';
import { CorrectionSchemas } from '../../../src/preference/core/value-objects/CorrectionSchemas';
import { BasalSchemas } from '../../../src/preference/core/value-objects/BasalSchemas';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

interface PreferenceOverrides {
  userId?: string;
  profileImg?: string;
  unitMeasure?: string;
  thresholds?: { hypo: number; hiper: number };
  insulinRatios?: { breakfast: number; lunch: number; dinner: number };
  sensitivity?: number;
  correctionSchemas?:
    | { rangeMin: number; rangeMax: number; dose: number }[]
    | null;
  basalSchemas?: { injectionTime: string; dose: number }[] | null;
}

export class PreferenceFactory {
  static createInstance(overrides: PreferenceOverrides = {}): Preference {
    return new Preference({
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      profileImg: ProfileImg.create(
        overrides.profileImg ?? '/img/avatar.png',
      ).getValue(),
      unitMeasure: UnitMeasure.create(
        overrides.unitMeasure ?? 'mg/dL',
      ).getValue(),
      thresholds: Thresholds.create(
        overrides.thresholds ?? { hypo: 70, hiper: 180 },
      ).getValue(),
      insulinRatios: InsulinRatios.create(
        overrides.insulinRatios?.breakfast ?? 10,
        overrides.insulinRatios?.lunch ?? 12,
        overrides.insulinRatios?.dinner ?? 15,
      ).getValue(),
      sensitivity: SensitivityFactor.create(
        overrides.sensitivity ?? 30,
      ).getValue(),
      correctionSchemas: CorrectionSchemas.create(
        overrides.correctionSchemas === undefined
          ? [{ rangeMin: 0, rangeMax: 70, dose: 1 }]
          : overrides.correctionSchemas,
      ).getValue(),
      basalSchemas: BasalSchemas.create(
        overrides.basalSchemas === undefined
          ? [{ injectionTime: '08:30', dose: 5 }]
          : overrides.basalSchemas,
      ).getValue(),
    });
  }
}
