import { z } from "zod";

// Definimos el esquema
export const loginSchema = z.object({
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

// Zod infiere el tipo de TypeScript automáticamente
export type LoginData = z.infer<typeof loginSchema>;

