import { Result } from '../../../shared/result';
import { GlucoseMealTagInvalidError } from '../errors/GlucoseMealTagInvalidError';

const VALID_TAGS = ['En Ayunas', 'Despues de comer', 'Control general'] as const;
export type MealTag = typeof VALID_TAGS[number];

export class GlucoseMealTag {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<GlucoseMealTag, GlucoseMealTagInvalidError> {
    if (!value || !VALID_TAGS.includes(value as MealTag)) {
      return Result.fail(
        new GlucoseMealTagInvalidError(`La etiqueta de comida debe ser: ${VALID_TAGS.join(', ')}`).withCode('GLUCOSE_MEAL_TAG_INVALID', 'mealTag'),
      );
    }
    return Result.ok(new GlucoseMealTag(value));
  }

  static get validTags(): readonly string[] {
    return VALID_TAGS;
  }
}
