import { z } from 'zod';

// 1. Esquemas para los valores específicos
export const ThemeSchema = z.enum(['light', 'dark', 'system'] as const);
export const LocaleSchema = z.enum(['es', 'ja', 'en', 'pt'] as const);

// 2. Esquema principal de Preferencias
export const PreferenceSchema = z.object({
  userId: z.string().uuid(), // Validamos que sea un UUID
  profileImg: z.string().min(1),
  unitMeasure: z.string().min(1),
  thresholds: z.object({
    hypo: z.number().positive(),
    hiper: z.number().positive(),
  }),
  insulinRatios: z.object({
    breakfast: z.number().nonnegative(),
    lunch: z.number().nonnegative(),
    dinner: z.number().nonnegative(),
  }),
  sensitivity: z.number().positive(),
  locale: LocaleSchema,
  theme: ThemeSchema,
});

// 3. Inferir el tipo de TypeScript desde el esquema de Zod
export type Preference = z.infer<typeof PreferenceSchema>;