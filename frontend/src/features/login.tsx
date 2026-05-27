import { Box, useTheme, Typography, TextField, Button, Link, Alert } from "@mui/material";
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

export default function Login() {
    const theme = useTheme();
    const login = useAuthStore((state) => state.login);
    const loginWithProvider = useAuthStore((state) => state.loginWithProvider);

    const navigate = useNavigate();

    // Estado local para manejar errores de autenticación del backend
    const [authError, setAuthError] = useState<BackendErrorResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Configuración de React Hook Form
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
            await login(data.email, data.password);
            navigate("/");
        } catch (error) {
            let message = "Error al iniciar sesión. Inténtalo de nuevo.";

            // Comprobamos de manera segura si es un error de Axios
            if (axios.isAxiosError(error)) {
                // Tipamos el error con nuestra interfaz del backend
                const axiosError = error as AxiosError<BackendErrorResponse>;

                // Ahora TypeScript sabe EXACTAMENTE que data tiene .message
                message = axiosError.response?.data?.message || message;
            } else if (error instanceof Error) {
                // Por si es un error nativo de JS (ej. problemas de red nativos)
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
            bgcolor: theme.palette.background.default || '#f5f5f5',
            p: 3
        }}>
            {/* Contenedor de las dos tarjetas */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' }, // Responsivo para móviles
                gap: 4,
                justifyContent: 'center',
                alignItems: 'stretch',
                maxWidth: '900px',
                width: '100%'
            }}>
                {/* Columna izquierda - Bienvenida */}
                <Box sx={{
                    flex: 1,
                    bgcolor: theme.palette.primary.light,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: 3,
                    minHeight: '500px',
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        ¡Bienvenido, Guerrero!
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
                        Prepárate para la batalla de hoy. Entra a tu panel, asegura tu bienestar y mantente firme en la zona segura.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 'auto' }}>
                        ¿Aún no tienes cuenta?{' '}
                        <Link href="#" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                            Registrarse
                        </Link>
                    </Typography>
                </Box>

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
                        <LoginIcon sx={{ fontSize: 50, color: 'white', mb: 1 }} />
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                            Iniciar Sesión
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                            Ingresa tus credenciales para acceder
                        </Typography>

                        {/* Mostrar alertas de error del backend */}
                        {authError && (
                            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                                {authError.message}
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
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.email ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiInputBase-input': { color: 'white' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        {/* INPUT CONTRASEÑA */}
                        <TextField
                            {...register("password")}
                            fullWidth
                            label="Contraseña"
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
                                '& .MuiInputBase-input': { color: 'white' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        {/* 1. BOTÓN PRINCIPAL CORREGIDO */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting} // Se deshabilita visualmente, pero no destruye el nodo de texto
                            sx={{
                                mb: 2,
                                py: 1,
                                bgcolor: 'white',
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            {/* Dejamos el texto fijo para evitar que cambie el DOM interno drásticamente en el submit */}
                            {isSubmitting ? "Cargando..." : "Ingresar"}
                        </Button>

                        {/* Divisor */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', px: 2, whiteSpace: 'nowrap' }}>
                                O continuar con
                            </Typography>
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                        </Box>

                        {/* 2. BOTONES SOCIALES CON STOP PROPAGATION */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%' }}>
                            {/* Botón Google */}
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={isSubmitting}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // 👈 CRÍTICO: Evita que el click interactúe con el <form> o los Inputs de MUI
                                    setAuthError(null);
                                    setIsSubmitting(true);
                                    try {
                                        await loginWithProvider('google');
                                        navigate("/");
                                    } catch (err: unknown) {
                                        if (axios.isAxiosError(err)) {
                                            setAuthError({ message: err.response?.data.message || "Error desconocido" });
                                        } else {
                                            setAuthError({ message: "Error desconocido" });
                                        }
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                Google
                            </Button>

                            {/* Botón Facebook */}
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={isSubmitting}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // 👈 CRÍTICO
                                    setAuthError(null);
                                    setIsSubmitting(true);
                                    try {
                                        await loginWithProvider('facebook');
                                        navigate("/");
                                    } catch (err: unknown) {
                                        if (axios.isAxiosError(err)) {
                                            setAuthError({ message: err.response?.data.message || "Error desconocido" });
                                        } else {
                                            setAuthError({ message: "Error desconocido" });
                                        }
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                Facebook
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                ¿Olvidaste tu contraseña?
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
                pt: 2
            }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Patrocinado por
                </Typography>
                <LogoGA />
            </Box>
        </Box>
    );
}