// src/database/models/HbA1c.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export default class HbA1c extends Model {
  static table = 'hba1c';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @field('value_percent') valuePercent!: number;
  @date('exam_date') examDate!: Date;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
