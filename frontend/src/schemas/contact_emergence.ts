import { z } from "zod";

const parentescos = ["madre", "padre", "hermano", "hermana", "abuelo", "abuela", "tio", "tia", "tutor", "otro"] as const;

const PHONE_PATTERN = /^[+0-9\s()-]{7,20}$/;

export const contactNameSchema = z
  .string()
  .max(50, "El nombre no puede exceder los 50 caracteres")
  .refine(
    (value) => value.trim().length >= 3,
    "El nombre debe tener al menos 3 caracteres",
  );

export const contactPhoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || PHONE_PATTERN.test(value.trim()),
    "El teléfono debe tener entre 7 y 15 dígitos",
  );

export const contactEmergenceSchema = z.object({
  name: contactNameSchema,
  parentesco: z.string()
    .min(1, "Selecciona un parentesco")
    .refine((val) => (parentescos as readonly string[]).includes(val), "Parentesco no válido"),
  telefono: contactPhoneSchema,
});

export type ContactEmergenceData = z.infer<typeof contactEmergenceSchema>;
