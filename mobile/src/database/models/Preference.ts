// src/database/models/Preference.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, json, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export type Thresholds = {
  hypo: number;
  hiper: number;
};

export type InsulinRatios = {
  breakfast: number;
  lunch: number;
  dinner: number;
};

export type JsonObject = Record<string, unknown>;

const asThresholds = (raw: unknown): Thresholds =>
  raw && typeof raw === 'object' ? (raw as Thresholds) : { hypo: 70, hiper: 180 };

const asInsulinRatios = (raw: unknown): InsulinRatios =>
  raw && typeof raw === 'object'
    ? (raw as InsulinRatios)
    : { breakfast: 1, lunch: 1, dinner: 1 };

const asNullableObject = (raw: unknown): JsonObject | null =>
  raw && typeof raw === 'object' ? (raw as JsonObject) : null;

export default class Preference extends Model {
  static table = 'preferences';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @text('profile_img') profileImg!: string;
  @text('unit_measure') unitMeasure!: string;
  @field('sensitivity') sensitivity!: number;
  @json('thresholds', asThresholds) thresholds!: Thresholds;
  @json('insulin_ratios', asInsulinRatios) insulinRatios!: InsulinRatios;
  @json('correction_schemas', asNullableObject) correctionSchemas!: JsonObject | null;
  @json('basal_schemas', asNullableObject) basalSchemas!: JsonObject | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
