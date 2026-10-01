import { faker } from '@faker-js/faker';
import { HbA1c } from '../../../src/glucose/core/HbA1c';
import { HbA1cId } from '../../../src/glucose/core/value-objects/HbA1cId';
import { HbA1cValue } from '../../../src/glucose/core/value-objects/HbA1cValue';
import { HbA1cExamDate } from '../../../src/glucose/core/value-objects/HbA1cExamDate';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

interface HbA1cOverrides {
  id?: string;
  userId?: string;
  valuePercent?: number;
  examDate?: Date;
  createdAt?: Date;
}

export class HbA1cFactory {
  static createInstance(overrides: HbA1cOverrides = {}): HbA1c {
    return new HbA1c({
      id: HbA1cId.create(overrides.id ?? faker.string.uuid()).getValue(),
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      valuePercent: HbA1cValue.create(overrides.valuePercent ?? 6.5).getValue(),
      examDate: HbA1cExamDate.create(
        overrides.examDate ?? new Date(),
      ).getValue(),
      createdAt: overrides.createdAt ?? new Date(),
    });
  }
}
