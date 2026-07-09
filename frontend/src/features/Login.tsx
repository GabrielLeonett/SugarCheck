import { Box, useTheme, Typography, TextField, Link, Alert, Button } from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";
import LoginIcon from '@mui/icons-material/Login';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginData } from "../schemas/login";
import type { AxiosError } from "axios";
import type { BackendErrorResponse } from "../types/types";
import axios from "axios";
import GlucoSaludando from '../assets/gluco-saludo.png';
import { ConfigRow } from "../components/ui/ConfigRow";
import useLanguage from "../hooks/useLanguage";
import { CardBase } from "../components/ui/Cards/CardBase";
import { ButtonBase } from "../components/ui/Buttons/ButtonBase";

//Svgs
import FacebookIcon from '../assets/icons/facebook.svg'
import GoogleIcon from '../assets/icons/google.svg'

export default function Login() {
    const theme = useTheme();
    const login = useAuthStore((state) => state.login);
    const loginWithProvider = useAuthStore((state) => state.loginWithProvider);

    // Cambiado al namespace 'login' para cargar las llaves correctas
    const { t } = useLanguage("login");

    const navigate = useNavigate();

    // Estado local para manejar errores de autenticación del backend
    const [authError, setAuthError] = useState<BackendErrorResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Configuración de React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        shouldFocusError: true,
    });

    const onSubmit = async (data: LoginData) => {
        setAuthError(null);
        setIsSubmitting(true);

        try {
            await login(data.username, data.password);
            navigate("/");
        } catch (error) {
            // Error por defecto traducido
            let message = t("errors.defaultBackendError");

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<BackendErrorResponse>;
                message = axiosError.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }

            setAuthError({ message });
        } finally {
            setIsSubmitting(false);
        }
    };
    console.log(t('welcomeTitle'))

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
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
                {/* Columna izquierda - Bienvenida */}
                <CardBase elevation={5} sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    minHeight: '500px',
                }}>
                    <Box
                        component="img"
                        src={GlucoSaludando}
                        alt="Ilustración de Bienvenida"
                        sx={{
                            width: '160px',
                            height: 'auto',
                            mb: 1,
                        }}
                    />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {t("welcomeTitle")}
                    </Typography>

                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
                        {t("welcomeDescription")}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 'auto' }}>
                        {t("noAccount")}{' '}
                        <Link href="/register" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                            {t("registerLink")}
                        </Link>
                    </Typography>
                </CardBase>

                {/* Columna derecha - Formulario encapsulado en un tag <form> */}
                <Box
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
                        minHeight: '500px',
                    }}
                >
                    <Box sx={{ maxWidth: '350px', width: '100%', textAlign: 'center' }}>
                        <LoginIcon sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {t("formTitle")}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                            {t("formSubtitle")}
                        </Typography>

                        {/* Mostrar alertas de error del backend */}
                        {authError && (
                            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                                {authError.message}
                            </Alert>
                        )}

                        {/* INPUT USUARIO */}
                        <TextField
                            {...register("username")}
                            fullWidth
                            label={t("usernameLabel")}
                            variant="outlined"
                            size="small"
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            disabled={isSubmitting}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.username ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        {/* INPUT CONTRASEÑA */}
                        <TextField
                            {...register("password")}
                            fullWidth
                            label={t("passwordLabel")}
                            type="password"
                            variant="outlined"
                            size="small"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isSubmitting}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.password ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        {/* BOTÓN PRINCIPAL */}
                        <ButtonBase
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                mb: 2,
                                py: 1,
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            {isSubmitting ? t("submittingButton") : t("submitButton")}
                        </ButtonBase>

                        {/* Divisor */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', px: 2, whiteSpace: 'nowrap' }}>
                                {t("oauthDivider")}
                            </Typography>
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                        </Box>

                        {/* BOTONES SOCIALES */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%' }}>

                            {/* Botón Google */}
                            <Button
                                fullWidth
                                startIcon={<img src={GoogleIcon} alt="Google" style={{ width: 20, height: 20 }} />}
                                variant="outlined"
                                disabled={isSubmitting}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAuthError(null);
                                    setIsSubmitting(true);
                                    try {
                                        await loginWithProvider('google');
                                        navigate("/");
                                    } catch (err: unknown) {
                                        if (axios.isAxiosError(err)) {
                                            setAuthError({ message: err.response?.data.message || t("errors.unknownError") });
                                        } else {
                                            setAuthError({ message: t("errors.unknownError") });
                                        }
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                sx={{
                                    backgroundColor: '#ffffff',
                                    color: '#1f1f1f',
                                    borderColor: '#747775',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: '#f7f8f8',
                                        borderColor: '#747775',
                                    }
                                }}
                            >
                                Google
                            </Button>

                            {/* Botón Facebook */}
                            <Button
                                fullWidth
                                startIcon={<img src={FacebookIcon} alt="Facebook" style={{ width: 20, height: 20 }} />}
                                variant="contained"
                                disabled={isSubmitting}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAuthError(null);
                                    setIsSubmitting(true);
                                    try {
                                        await loginWithProvider('facebook');
                                        navigate("/");
                                    } catch (err: unknown) {
                                        if (axios.isAxiosError(err)) {
                                            setAuthError({ message: err.response?.data.message || t("errors.unknownError") });
                                        } else {
                                            setAuthError({ message: t("errors.unknownError") });
                                        }
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                sx={{
                                    backgroundColor: '#1877F2',
                                    color: '#ffffff',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: '#166FE5',
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                Facebook
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/olvidoContrasena" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                {t("forgotPassword")}
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer - Patrocinado por */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 5,
                gap: 2
            }}>
                <ConfigRow />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {t("sponsoredBy")}
                    </Typography>
                    <LogoGA />
                </Box>
            </Box>
        </Box>
    );
}