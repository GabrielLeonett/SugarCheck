// src/database/models/Imc.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export default class Imc extends Model {
  static table = 'imcs';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @field('peso') peso!: number;
  @field('altura') altura!: number;
  @field('imc_value') imcValue!: number;
  @date('fecha') fecha!: Date;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
