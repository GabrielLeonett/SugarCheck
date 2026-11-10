// src/database/schema.ts
//
// Espejo local (offline) del esquema Prisma de `backend/prisma/schema.prisma`.
// Los nombres de tablas/columnas usan snake_case, como recomienda WatermelonDB.
// Los campos JSON (roles, thresholds, insulinRatios, etc.) se guardan como string.
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'sexo', type: 'string' },
        { name: 'roles', type: 'string' }, // JSON: string[]
        { name: 'fecha_nacimiento', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'preferences',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'profile_img', type: 'string' },
        { name: 'unit_measure', type: 'string' },
        { name: 'sensitivity', type: 'number' },
        { name: 'thresholds', type: 'string' }, // JSON
        { name: 'insulin_ratios', type: 'string' }, // JSON
        { name: 'correction_schemas', type: 'string', isOptional: true }, // JSON
        { name: 'basal_schemas', type: 'string', isOptional: true }, // JSON
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'contact_emergences',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'parentesco', type: 'string' },
        { name: 'telefono', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'imcs',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'peso', type: 'number' },
        { name: 'altura', type: 'number' },
        { name: 'imc_value', type: 'number' },
        { name: 'fecha', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'glucose',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'value_mgdl', type: 'number' },
        { name: 'meal_tag', type: 'string' },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'time', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'hba1c',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'value_percent', type: 'number' },
        { name: 'exam_date', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'conversations',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'messages',
      columns: [
        { name: 'conversation_id', type: 'string', isIndexed: true },
        { name: 'role', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'insulinas',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'tipo', type: 'string' },
        { name: 'dosis', type: 'number' },
        { name: 'unidades', type: 'number' },
        { name: 'fecha', type: 'number', isIndexed: true },
        { name: 'hora', type: 'string' },
        { name: 'zona', type: 'string' },
        { name: 'contexto', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'camino_progreso',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'ultimo_nivel_completado', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
