// src/database/models/Glucose.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export default class Glucose extends Model {
  static table = 'glucose';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @field('value_mgdl') valueMgdl!: number;
  @text('meal_tag') mealTag!: string;
  @date('date') date!: Date;
  @text('time') time!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
