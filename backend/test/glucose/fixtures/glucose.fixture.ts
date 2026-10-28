import { faker } from '@faker-js/faker';
import { Glucose } from '../../../src/glucose/core/Glucose';
import { GlucoseId } from '../../../src/glucose/core/value-objects/GlucoseId';
import { GlucoseValue } from '../../../src/glucose/core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../../../src/glucose/core/value-objects/GlucoseMealTag';
import { GlucoseDate } from '../../../src/glucose/core/value-objects/GlucoseDate';
import { GlucoseTime } from '../../../src/glucose/core/value-objects/GlucoseTime';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

export const VALID_MEAL_TAGS = [
  'En Ayunas',
  'Despues de comer',
  'Control general',
] as const;

interface GlucoseOverrides {
  id?: string;
  userId?: string;
  valueMgdl?: number;
  mealTag?: string;
  date?: Date;
  time?: string;
  createdAt?: Date;
}

export class GlucoseFactory {
  static createInstance(overrides: GlucoseOverrides = {}): Glucose {
    return new Glucose({
      id: GlucoseId.create(overrides.id ?? faker.string.uuid()).getValue(),
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      valueMgdl: GlucoseValue.create(overrides.valueMgdl ?? 110).getValue(),
      mealTag: GlucoseMealTag.create(
        overrides.mealTag ?? VALID_MEAL_TAGS[0],
      ).getValue(),
      date: GlucoseDate.create(overrides.date ?? new Date()).getValue(),
      time: GlucoseTime.create(overrides.time ?? '08:30').getValue(),
      createdAt: overrides.createdAt ?? new Date(),
    });
  }

  static createManyInstances(
    count: number,
    overrides: GlucoseOverrides = {},
  ): Glucose[] {
    return Array.from({ length: count }, () => this.createInstance(overrides));
  }
}
