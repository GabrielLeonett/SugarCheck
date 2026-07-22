import { z } from "zod";
import type { CreateGlucosePayload } from '../apis/glucose';

export const glucosaSchema = z.object({
  nivelGlucosa: z.string()
    .min(1, "El nivel de glucosa es obligatorio")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 600,
      "Ingresa un valor válido (mg/dL)",
    ),
  contexto: z.string().min(1, "Selecciona un contexto"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "La hora debe tener formato HH:mm"),
});

export type GlucosaData = z.infer<typeof glucosaSchema>;

export function formToCreateGlucoseDto(formData: GlucosaData): CreateGlucosePayload {
  return {
    valueMgdl: Number(formData.nivelGlucosa),
    mealTag: formData.contexto,
    date: formData.fecha,
    time: formData.hora,
  };
}
