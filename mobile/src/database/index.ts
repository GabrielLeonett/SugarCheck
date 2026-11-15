// src/database/index.ts
//
// Base de datos local para iOS/Android. En web se usa `index.web.ts`
// (LokiJS + IndexedDB), porque el adaptador SQLite es nativo.
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { modelClasses } from './models';
import { mySchema } from './schema';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  // jsi: true, // Actívalo cuando uses un development build con JSI habilitado
  onSetUpError: (error) => {
    console.error('Error inicializando la base de datos:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses,
});

export { modelClasses };
