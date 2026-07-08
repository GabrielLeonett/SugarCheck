import { z } from "zod";

export const hba1cSchema = z.object({
  resultadoHbA1c: z.string()
    .min(1, "El resultado es obligatorio")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 20,
      "Ingresa un porcentaje válido (0-20%)",
    ),
  fecha: z.string().min(1, "La fecha es obligatoria"),
});

export type HbA1cData = z.infer<typeof hba1cSchema>;
