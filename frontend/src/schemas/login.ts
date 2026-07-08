import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(30).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Solo letras, números, guiones y guiones bajos"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginData = z.infer<typeof loginSchema>;
