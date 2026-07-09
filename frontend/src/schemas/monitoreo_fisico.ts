import { z } from "zod";

export const monitoreoFisicoSchema = z.object({
  peso: z.string()
    .min(1, "El peso es obligatorio")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 500,
      "Ingresa un peso válido (kg)",
    ),
  estatura: z.string()
    .min(1, "La talla es obligatoria")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 300,
      "Ingresa una talla válida (cm)",
    ),
  dd: z.string()
    .min(1, "Requerido")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31,
      "Día inválido (1-31)",
    ),
  mm: z.string()
    .min(1, "Requerido")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 12,
      "Mes inválido (1-12)",
    ),
  aaaa: z.string()
    .min(1, "Requerido")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1900 && Number(val) <= 2100,
      "Año inválido",
    ),
});

export type MonitoreoFisicoData = z.infer<typeof monitoreoFisicoSchema>;
