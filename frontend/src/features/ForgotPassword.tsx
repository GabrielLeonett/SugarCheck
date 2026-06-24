import { Box, useTheme, Typography, TextField, Link, Alert } from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";
import LockResetIcon from '@mui/icons-material/LockReset'; // Icono adecuado para recuperar contraseña
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod"; // Creamos un esquema rápido aquí o puedes importarlo de tus schemas
import axios from "axios";
import type { AxiosError } from "axios";
import { apiPrivate } from '../apis/axios';
import type { BackendErrorResponse } from "../types/types";
import GlucoOlvido from '../assets/gluco-olvido.png';
import { CardBase } from "../components/ui/Cards/CardBase";
import { ButtonBase } from "../components/ui/Buttons/ButtonBase";

// 1. Esquema de validación específico para recuperar contraseña
const forgotPasswordSchema = z.object({
    email: z.string().email("Ingresa un correo electrónico válido"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const theme = useTheme();

    // Estados locales para el feedback del usuario
    const [authError, setAuthError] = useState<BackendErrorResponse | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Configuración de React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange",
        shouldFocusError: true,
    });

    // 3. Función de envío a la apiPrivate
    const onSubmit = async (data: ForgotPasswordData) => {
        setAuthError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        try {
            // Hacemos el POST usando la instancia "apiPrivate" que ya tiene configurada la baseURL
            // Ajusta '/auth/forgot-password' según el endpoint exacto de tu backend
            const response = await apiPrivate.post("/auth/forgot-password", { email: data.email });

            // Si tu backend retorna un mensaje de éxito dinámico, puedes usar: response.data.message
            setSuccessMessage(response.data?.message || "Se ha enviado un correo de recuperación si la cuenta existe.");

        } catch (error) {
            let message = "Error al procesar la solicitud. Inténtalo de nuevo.";

            // Seguimos usando el 'axios' global para validar la naturaleza del error
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<BackendErrorResponse>;
                // Extraemos limpiamente el mensaje estructurado de tu backend
                message = axiosError.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }

            setAuthError({ message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            p: 3
        }}>
            {/* Contenedor de las dos tarjetas */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                justifyContent: 'center',
                alignItems: 'stretch',
                maxWidth: '900px',
                width: '100%'
            }}>
                {/* Columna izquierda - Bienvenida / Información */}
                <CardBase elevation={5} sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    textAlign: 'center',
                    minHeight: '300px',
                }}>
                    {/* Mantienes tu imagen aquí arriba si lo deseas */}
                    <Box component="img" src={GlucoOlvido} sx={{ width: 160, height: 'auto', mb: 2, borderRadius: 2 }} />

                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        ¿Olvidaste tu contraseña?
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '350px', mb: 4 }}>
                        No te preocupes. Incluso los guerreros más experimentados necesitan un recordatorio.
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 'auto' }}>
                        <Link href="/login" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Volver a Iniciar Sesión
                        </Link>
                    </Typography>
                </CardBase>

                {/* Columna derecha - Formulario de recuperación */}
                <CardBase
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        flex: 1,
                        bgcolor: theme.palette.primary.dark,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 3,
                        minHeight: '300px',
                    }}
                >
                    <Box sx={{ maxWidth: '350px', width: '100%', textAlign: 'center' }}>
                        <LockResetIcon sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Recuperar Acceso
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 5 }}>
                            Ingresa tu correo para instrucciones
                        </Typography>

                        {/* Mostrar alertas de error */}
                        {authError && (
                            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                                {authError.message}
                            </Alert>
                        )}

                        {/* Mostrar alerta de éxito */}
                        {successMessage && (
                            <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
                                {successMessage}
                            </Alert>
                        )}

                        {/* INPUT CORREO */}
                        <TextField
                            {...register("email")}
                            fullWidth
                            label="Correo electrónico"
                            variant="outlined"
                            size="small"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isSubmitting}
                            sx={{
                                mb: 5,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.email ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiInputBase-input': {},
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        {/* BOTÓN PRINCIPAL */}
                        <ButtonBase
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enviando..." : "Enviar enlace"}
                        </ButtonBase>
                    </Box>
                </CardBase>
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, pt: 2 }}>
                <Typography variant="body2" sx={{  mb: 1 }}>
                    Patrocinado por
                </Typography>
                <LogoGA />
            </Box>
        </Box>
    );
}