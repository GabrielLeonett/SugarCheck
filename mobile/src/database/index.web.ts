// src/database/index.web.ts
//
// En web no existe el módulo nativo de SQLite, así que WatermelonDB usa
// LokiJS con persistencia en IndexedDB.
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { modelClasses } from './models';
import { mySchema } from './schema';

const adapter = new LokiJSAdapter({
  schema: mySchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => {
    console.error('Error inicializando la base de datos (web):', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses,
});

export { modelClasses };
