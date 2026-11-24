// src/database/models/Insulina.ts
import { associations, Model } from '@nozbe/watermelondb';
import { date, field, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';

export type TipoInsulina = 'RAPIDA' | 'LENTA';
export type ContextoInsulina = 'DESAYUNO' | 'ALMUERZO' | 'CENA' | 'CORRECCION';

export default class Insulina extends Model {
  static table = 'insulinas';

  static associations = associations(['users', { type: 'belongs_to', key: 'user_id' }]);

  @text('user_id') userId!: string;
  @text('tipo') tipo!: TipoInsulina;
  @field('dosis') dosis!: number;
  @field('unidades') unidades!: number;
  @date('fecha') fecha!: Date;
  @text('hora') hora!: string;
  @text('zona') zona!: string;
  @text('contexto') contexto!: ContextoInsulina | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt!: Date | null;

  @relation('users', 'user_id') user!: User;
}
