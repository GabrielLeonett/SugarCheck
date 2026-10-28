import { z } from 'zod';

// 1. Esquemas para los valores específicos
export const ThemeSchema = z.enum(['light', 'dark', 'system'] as const);
export const LocaleSchema = z.enum(['es', 'ja', 'en', 'pt'] as const);

export const CorrectionSchemaItemSchema = z.object({
  rangeMin: z.number().min(0),
  rangeMax: z.number().min(1),
  dose: z.number().min(1),
});

export const BasalSchemaItemSchema = z.object({
  injectionTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm requerido'),
  dose: z.number().min(1),
});

// 2. Esquema principal de Preferencias
export const PreferenceSchema = z.object({
  userId: z.string().uuid(),
  profileImg: z.string().min(1),
  unitMeasure: z.string().min(1),
  thresholds: z.object({
    hypo: z.number().positive(),
    hiper: z.number().positive(),
  }),
  // Parámetros retirados de la UI. Se mantienen opcionales por compatibilidad
  // con respuestas antiguas del backend.
  insulinRatios: z
    .object({
      breakfast: z.number().nonnegative(),
      lunch: z.number().nonnegative(),
      dinner: z.number().nonnegative(),
    })
    .optional(),
  sensitivity: z.number().positive().optional(),
  correctionSchemas: z.array(CorrectionSchemaItemSchema).optional().default([]),
  basalSchemas: z.array(BasalSchemaItemSchema).optional().default([]),
  locale: LocaleSchema,
  theme: ThemeSchema,
});

// 3. Inferir el tipo de TypeScript desde el esquema de Zod
export type Preference = z.infer<typeof PreferenceSchema>;
export type CorrectionSchemaItem = z.infer<typeof CorrectionSchemaItemSchema>;
export type BasalSchemaItem = z.infer<typeof BasalSchemaItemSchema>;