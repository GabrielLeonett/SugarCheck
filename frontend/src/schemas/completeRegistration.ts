import { z } from "zod";

export const healthStepSchema = z.object({
  peso: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) < 500),
    "Ingresa un peso válido (kg)",
  ),
  talla: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) < 300),
    "Ingresa una talla válida (cm)",
  ),
  glucosaMin: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) < 600),
    "Ingresa un valor válido (mg/dL)",
  ),
  glucosaMax: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 600),
    "Ingresa un valor válido (mg/dL)",
  ),
});

export const emergencyContactSchema = z.object({
  nombreGuardián: z.string().optional(),
  parentesco: z.enum(
    ["madre", "padre", "hermano", "hermana", "abuelo", "abuela", "tio", "tia", "tutor", "otro"] as const,
    { message: "Selecciona un parentesco" },
  ).optional(),
  telefono: z.string().optional(),
});

export const completeRegistrationSchema = healthStepSchema.merge(emergencyContactSchema);

export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>;
