import { z } from "zod";

const parentescos = ["madre", "padre", "hermano", "hermana", "abuelo", "abuela", "tio", "tia", "tutor", "otro"] as const;

export const contactEmergenceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  parentesco: z.string()
    .min(1, "Selecciona un parentesco")
    .refine((val) => (parentescos as readonly string[]).includes(val), "Parentesco no válido"),
  telefono: z.string().optional(),
});

export type ContactEmergenceData = z.infer<typeof contactEmergenceSchema>;
