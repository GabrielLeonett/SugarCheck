import { UserId } from '../../shared/core/value-objects/UserId';
import { InsulinRatios } from './value-objects/InsulinRatios';
import { Locale } from './value-objects/Locale';
import { ProfileImg } from './value-objects/ProfileImg';
import { SensitivityFactor } from './value-objects/SensitivityFactor';
import { Theme } from './value-objects/Theme';
import { Thresholds } from './value-objects/Thresholds';
import { UnitMeasure } from './value-objects/UnitMeasure';

interface PreferenceProps {
  userId: UserId;
  profileImg: ProfileImg;
  unitMeasure: UnitMeasure;
  thresholds: Thresholds;
  insulinRatios: InsulinRatios;
  sensitivity: SensitivityFactor;
  locale: Locale;
  theme: Theme;
}

export interface PreferencePlain {
  userId: string;
  profileImg: string;
  unitMeasure: string;
  thresholds: { hypo: number; hiper: number };
  insulinRatios: { breakfast: number; lunch: number; dinner: number };
  sensitivity: number;
  locale: string;
  theme: string;
}

export class Preference {
  private readonly _userId: UserId;
  private readonly _profileImg: ProfileImg;
  private readonly _unitMeasure: UnitMeasure;
  private readonly _thresholds: Thresholds;
  private readonly _insulinRatios: InsulinRatios;
  private readonly _sensitivity: SensitivityFactor;
  private readonly _locale: Locale;
  private readonly _theme: Theme;

  constructor(props: PreferenceProps) {
    this._userId = props.userId;
    this._profileImg = props.profileImg;
    this._unitMeasure = props.unitMeasure;
    this._thresholds = props.thresholds;
    this._insulinRatios = props.insulinRatios;
    this._sensitivity = props.sensitivity;
    this._locale = props.locale;
    this._theme = props.theme;
  }

  // Getters
  get userId(): UserId { return this._userId; }
  get profileImg(): ProfileImg { return this._profileImg; }
  get unitMeasure(): UnitMeasure { return this._unitMeasure; }
  get thresholds(): Thresholds { return this._thresholds; }
  get insulinRatios(): InsulinRatios { return this._insulinRatios; }
  get sensitivity(): SensitivityFactor { return this._sensitivity; }
  get locale(): Locale { return this._locale; }
  get theme(): Theme { return this._theme; }

  public toPlain(): PreferencePlain {
    return {
      userId: this._userId.value,
      profileImg: this._profileImg.value,
      unitMeasure: this._unitMeasure.value,
      thresholds: {
        hypo: this._thresholds.value.hypo,
        hiper: this._thresholds.value.hiper,
      },
      insulinRatios: {
        breakfast: this._insulinRatios.breakfast,
        lunch: this._insulinRatios.lunch,
        dinner: this._insulinRatios.dinner,
      },
      sensitivity: this._sensitivity.value,
      locale: this._locale.value,
      theme: this._theme.value,
    };
  }
}