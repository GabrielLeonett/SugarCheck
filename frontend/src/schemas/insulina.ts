import { z } from 'zod';

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const insulinaZonaSchema = z
  .enum([
    'ABDOMEN_DERECHO',
    'ABDOMEN_IZQUIERDO',
    'MUSLO_DERECHO',
    'MUSLO_IZQUIERDO',
    'BRAZO_DERECHO',
    'BRAZO_IZQUIERDO',
    'GLUTEO_DERECHO',
    'GLUTEO_IZQUIERDO',
  ] as const)
  .optional();

export const insulinaRapidaSchema = z.object({
  dosis: z.number().positive('La dosis debe ser mayor a 0'),
  contexto: z.string().min(1, 'Selecciona un contexto de aplicación'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().regex(horaRegex, 'Formato de hora inválido'),
  zona: z.string().min(1, 'Selecciona una zona de aplicación'),
});

export const insulinaLentaSchema = insulinaRapidaSchema.omit({ contexto: true });

export type InsulinaRapidaData = z.infer<typeof insulinaRapidaSchema>;
export type InsulinaLentaData = z.infer<typeof insulinaLentaSchema>;

export const ZONA_MAP = {
  ABDOMEN_DERECHO: 'zoneAbdomenRight',
  ABDOMEN_IZQUIERDO: 'zoneAbdomenLeft',
  MUSLO_DERECHO: 'zoneThighRight',
  MUSLO_IZQUIERDO: 'zoneThighLeft',
  BRAZO_DERECHO: 'zoneArmRight',
  BRAZO_IZQUIERDO: 'zoneArmLeft',
  GLUTEO_DERECHO: 'zoneGluteRight',
  GLUTEO_IZQUIERDO: 'zoneGluteLeft',
} as const;

export type ZonaBackend = keyof typeof ZONA_MAP;