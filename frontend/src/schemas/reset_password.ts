import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Ingresa un correo válido'),
    code: z
      .string()
      .length(6, 'El código debe tener 6 dígitos')
      .regex(/^\d{6}$/, 'El código debe contener solo números'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/\d/, 'La contraseña debe incluir al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
