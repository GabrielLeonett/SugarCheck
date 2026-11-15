// src/database/models/Message.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, relation, text } from '@nozbe/watermelondb/decorators';
import type Conversation from './Conversation';

export default class Message extends Model {
  static table = 'messages';

  static associations = associations(['conversations', { type: 'belongs_to', key: 'conversation_id' }]);

  @text('conversation_id') conversationId!: string;
  @text('role') role!: string;
  @text('content') content!: string;
  @date('created_at') createdAt!: Date;

  @relation('conversations', 'conversation_id') conversation!: Conversation;
}
