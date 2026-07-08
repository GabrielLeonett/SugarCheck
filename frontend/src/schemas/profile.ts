import { z } from "zod";

export const profilePersonalSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(30).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Formato inválido").optional(),
  email: z.string().email("El correo no es válido").optional().or(z.literal("")),
  sexo: z.enum(["masculino", "femenino"] as const).optional(),
});

export const profileThresholdsSchema = z.object({
  hypo: z.number().min(10, "Mínimo 10").max(300, "Máximo 300"),
  hiper: z.number().min(10, "Mínimo 10").max(400, "Máximo 400"),
});

export const profileInsulinRatiosSchema = z.object({
  breakfast: z.number().nonnegative("Debe ser un valor positivo"),
  lunch: z.number().nonnegative("Debe ser un valor positivo"),
  dinner: z.number().nonnegative("Debe ser un valor positivo"),
});

export type ProfilePersonalData = z.infer<typeof profilePersonalSchema>;
export type ProfileThresholdsData = z.infer<typeof profileThresholdsSchema>;
export type ProfileInsulinRatiosData = z.infer<typeof profileInsulinRatiosSchema>;
