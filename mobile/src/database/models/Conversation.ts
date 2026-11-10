// src/database/models/Conversation.ts
import { associations, Model, Query } from '@nozbe/watermelondb';
import { children, date, relation, text } from '@nozbe/watermelondb/decorators';
import type Message from './Message';
import type User from './User';

export default class Conversation extends Model {
  static table = 'conversations';

  static associations = associations(
    ['users', { type: 'belongs_to', key: 'user_id' }],
    ['messages', { type: 'has_many', foreignKey: 'conversation_id' }],
  );

  @text('user_id') userId!: string;
  @text('title') title!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @relation('users', 'user_id') user!: User;
  @children('messages') messages!: Query<Message>;
}
