import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
