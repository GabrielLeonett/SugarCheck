// src/database/models/ContactEmergence.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export default class ContactEmergence extends Model {
  static table = 'contact_emergences';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @text('name') name!: string;
  @text('parentesco') parentesco!: string;
  @text('telefono') telefono!: string | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
