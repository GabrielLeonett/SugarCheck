import { z } from "zod";
import { contactNameSchema, contactPhoneSchema } from "./contact_emergence";

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
  telefono: contactPhoneSchema,
});

export const completeRegistrationSchema = healthStepSchema
  .merge(emergencyContactSchema)
  .superRefine((data, ctx) => {
    const hasAnyContactData = Boolean(
      data.nombreGuardián?.trim() || data.parentesco || data.telefono?.trim(),
    );
    if (!hasAnyContactData) return;

    const nameRes = contactNameSchema.safeParse(data.nombreGuardián ?? "");
    if (!nameRes.success) {
      ctx.addIssue({
        code: "custom",
        path: ["nombreGuardián"],
        message: nameRes.error.issues[0]?.message ?? "Ingresa el nombre del familiar",
      });
    }

    if (!data.parentesco) {
      ctx.addIssue({
        code: "custom",
        path: ["parentesco"],
        message: "Selecciona un parentesco",
      });
    }
  });

export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>;
