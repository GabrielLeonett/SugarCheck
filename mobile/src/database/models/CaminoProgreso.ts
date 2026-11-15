// src/database/models/CaminoProgreso.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export default class CaminoProgreso extends Model {
  static table = 'camino_progreso';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @field('ultimo_nivel_completado') ultimoNivelCompletado!: number;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @relation('users', 'user_id') user!: User;
}
