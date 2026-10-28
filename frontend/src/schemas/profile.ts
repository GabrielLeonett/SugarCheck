import { z } from "zod";

export const profilePersonalSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(30).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Formato inválido").optional(),
  email: z.string().email("El correo no es válido").optional().or(z.literal("")),
  sexo: z.enum(["masculino", "femenino"] as const).optional(),
  fechaNacimiento: z.string().optional(),
});

export type ProfilePersonalData = z.infer<typeof profilePersonalSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(/\d/, "La nueva contraseña debe incluir al menos un número"),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
