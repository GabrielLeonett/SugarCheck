import { z } from "zod";

export const registerStep1Schema = z.object({
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Debe comenzar con una letra. Solo letras, números, guiones"),
  nombre: z.string().optional(),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  sexo: z.enum(["masculino", "femenino"] as const, { message: "Selecciona un sexo" }),
  email: z.string().email("El correo electrónico no es válido").optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const registerStep2Schema = z.object({
  peso: z.string().min(1, "El peso es obligatorio").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 500,
    "Ingresa un peso válido (kg)",
  ),
  talla: z.string().min(1, "La talla es obligatoria").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 300,
    "Ingresa una talla válida (cm)",
  ),
  glucosaMin: z.string().min(1, "El mínimo es obligatorio").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) < 600,
    "Ingresa un valor válido (mg/dL)",
  ),
  glucosaMax: z.string().min(1, "El máximo es obligatorio").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 600,
    "Ingresa un valor válido (mg/dL)",
  ),
});

export const registerStep3Schema = z.object({
  nombreGuardián: z.string().min(1, "El nombre del guardián es obligatorio"),
  parentesco: z.enum(
    ["madre", "padre", "hermano", "hermana", "abuelo", "abuela", "tio", "tia", "tutor", "otro"] as const,
    { message: "Selecciona un parentesco" },
  ),
  telefono: z.string().optional(),
});

export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Data = z.infer<typeof registerStep3Schema>;
