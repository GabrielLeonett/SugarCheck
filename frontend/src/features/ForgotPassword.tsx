import { Box, useTheme, Typography, TextField, Link, Alert } from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";
import LockResetIcon from '@mui/icons-material/LockReset'; // Icono adecuado para recuperar contraseña
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios from "axios";
import type { AxiosError } from "axios";
import { apiPublic } from '../apis/axios';
import type { BackendErrorResponse } from "../types/types";
import GlucoOlvido from '../assets/gluco-olvido.png';
import { CardBase } from "../components/ui/Cards/CardBase";
import { ButtonBase } from "../components/ui/Buttons/ButtonBase";
import { forgotPasswordSchema, type ForgotPasswordData } from "../schemas/forgot_password";
import useLanguage from "../hooks/useLanguage";

export default function ForgotPassword() {
    const theme = useTheme();
    const { t } = useLanguage("forgotPassword");

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
            const response = await apiPublic.post("/auth/forgot-password", { email: data.email });

            // Si tu backend retorna un mensaje de éxito dinámico, puedes usar: response.data.message
            setSuccessMessage(response.data?.message || t("successMessage"));

        } catch (error) {
            let message = t("errorMessage");

            // Seguimos usando el 'axios' global para validar la naturaleza del error
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<BackendErrorResponse>;
                // Extraemos limpiamente el mensaje estructurado de tu backend
                message = axiosError.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }

            setAuthError({ message, statusCode: 0 });
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
                    p: { xs: 3, sm: 2 },
                    textAlign: 'center',
                    minHeight: { xs: 'auto', md: '300px' },
                }}>
                    {/* Mantienes tu imagen aquí arriba si lo deseas */}
                    <Box component="img" src={GlucoOlvido} sx={{ width: { xs: 120, sm: 160 }, height: 'auto', mb: 2, borderRadius: 2 }} />

                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {t("title")}
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '350px', mb: 4 }}>
                        {t("description")}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: { xs: 2, md: 'auto' } }}>
                        <Link href="/login" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            {t("backToLogin")}
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
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        boxShadow: 3,
                        minHeight: { xs: 'auto', md: '300px' },
                    }}
                >
                    <Box sx={{ maxWidth: '350px', width: '100%', textAlign: 'center' }}>
                        <LockResetIcon sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {t("formTitle")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 5 }}>
                            {t("formSubtitle")}
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
                            label={t("emailLabel")}
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
                            {isSubmitting ? t("sendingButton") : t("submitButton")}
                        </ButtonBase>
                    </Box>
                </CardBase>
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: { xs: 3, md: 5 }, mb: { xs: 2, md: 0 }, pt: 2 }}>
                <Typography variant="body2" sx={{  mb: 1 }}>
                    {t("sponsoredBy")}
                </Typography>
                <LogoGA />
            </Box>
        </Box>
    );
}