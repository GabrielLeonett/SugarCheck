import { z } from "zod";

const parentescos = ["madre", "padre", "hermano", "hermana", "abuelo", "abuela", "tio", "tia", "tutor", "otro"] as const;

// Teléfono opcional: admite dígitos, espacios, guiones y paréntesis, con longitud mínima razonable.
const telefonoSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^\+?[\d\s()-]{7,20}$/.test(val),
    "Ingresa un número telefónico válido",
  );

export const contactEmergenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  parentesco: z
    .string()
    .min(1, "Selecciona un parentesco")
    .refine((val) => (parentescos as readonly string[]).includes(val), "Parentesco no válido"),
  telefono: telefonoSchema,
});

export type ContactEmergenceData = z.infer<typeof contactEmergenceSchema>;
