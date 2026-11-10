// src/database/models/User.ts
import { associations, Model, Query } from '@nozbe/watermelondb';
import { children, date, json, text } from '@nozbe/watermelondb/decorators';
import type CaminoProgreso from './CaminoProgreso';
import type ContactEmergence from './ContactEmergence';
import type Conversation from './Conversation';
import type Glucose from './Glucose';
import type HbA1c from './HbA1c';
import type Imc from './Imc';
import type Insulina from './Insulina';
import type Preference from './Preference';

const toStringArray = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((value): value is string => typeof value === 'string') : [];

export default class User extends Model {
  static table = 'users';

  static associations = associations(
    ['preferences', { type: 'has_many', foreignKey: 'user_id' }],
    ['contact_emergences', { type: 'has_many', foreignKey: 'user_id' }],
    ['imcs', { type: 'has_many', foreignKey: 'user_id' }],
    ['glucose', { type: 'has_many', foreignKey: 'user_id' }],
    ['hba1c', { type: 'has_many', foreignKey: 'user_id' }],
    ['insulinas', { type: 'has_many', foreignKey: 'user_id' }],
    ['conversations', { type: 'has_many', foreignKey: 'user_id' }],
    ['camino_progreso', { type: 'has_many', foreignKey: 'user_id' }],
  );

  @text('name') name!: string;
  @text('username') username!: string;
  @text('email') email!: string | null;
  @text('sexo') sexo!: string;
  @json('roles', toStringArray) roles!: string[];
  @date('fecha_nacimiento') fechaNacimiento!: Date;
  @date('created_at') createdAt!: Date;

  @children('preferences') preferences!: Query<Preference>;
  @children('contact_emergences') contactEmergences!: Query<ContactEmergence>;
  @children('imcs') imcRecords!: Query<Imc>;
  @children('glucose') glucoseRecords!: Query<Glucose>;
  @children('hba1c') hba1cRecords!: Query<HbA1c>;
  @children('insulinas') insulinas!: Query<Insulina>;
  @children('conversations') conversations!: Query<Conversation>;
  @children('camino_progreso') caminoProgreso!: Query<CaminoProgreso>;
}
