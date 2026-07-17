import { Box, useTheme, Typography, TextField, Alert } from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";
import LockResetIcon from '@mui/icons-material/LockReset';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { AxiosError } from "axios";
import { apiPublic } from '../apis/axios';
import type { BackendErrorResponse } from "../types/types";
import { CardBase } from "../components/ui/Cards/CardBase";
import { ButtonBase } from "../components/ui/Buttons/ButtonBase";
import { resetPasswordSchema, type ResetPasswordData } from "../schemas/reset_password";
import useLanguage from "../hooks/useLanguage";

export default function ResetPassword() {
    const theme = useTheme();
    const { t } = useLanguage("resetPassword");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const emailFromUrl = searchParams.get('email') || '';
    const codeFromUrl = searchParams.get('code') || '';

    const [authError, setAuthError] = useState<BackendErrorResponse | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        shouldFocusError: true,
        defaultValues: { email: emailFromUrl, code: codeFromUrl },
    });

    const onSubmit = async (data: ResetPasswordData) => {
        setAuthError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        try {
            const response = await apiPublic.post("/auth/reset-password", {
                email: data.email,
                code: data.code,
                password: data.password,
            });

            setSuccessMessage(response.data?.message || t("successMessage"));

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            let message = t("errorMessage");

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
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                justifyContent: 'center',
                alignItems: 'stretch',
                maxWidth: '900px',
                width: '100%'
            }}>
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
                    <LockResetIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {t("title")}
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '350px', mb: 4 }}>
                        {t("description")}
                    </Typography>
                </CardBase>

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
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                            {t("formTitle")}
                        </Typography>

                        {authError && (
                            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                                {authError.message}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
                                {successMessage}
                            </Alert>
                        )}

                        <TextField
                            {...register("email")}
                            fullWidth
                            label={t("emailLabel")}
                            variant="outlined"
                            size="small"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isSubmitting || !!successMessage}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.email ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        <TextField
                            {...register("code")}
                            fullWidth
                            label={t("codeLabel")}
                            variant="outlined"
                            size="small"
                            error={!!errors.code}
                            helperText={errors.code?.message}
                            disabled={isSubmitting || !!successMessage}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.code ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        <TextField
                            {...register("password")}
                            fullWidth
                            type="password"
                            label={t("passwordLabel")}
                            variant="outlined"
                            size="small"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isSubmitting || !!successMessage}
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

                        <TextField
                            {...register("confirmPassword")}
                            fullWidth
                            type="password"
                            label={t("confirmPasswordLabel")}
                            variant="outlined"
                            size="small"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            disabled={isSubmitting || !!successMessage}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: errors.confirmPassword ? 'error.main' : 'rgba(255,255,255,0.3)' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiFormHelperText-root': { color: theme.palette.error.light }
                            }}
                        />

                        <ButtonBase
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting || !!successMessage}
                        >
                            {isSubmitting ? t("sendingButton") : t("submitButton")}
                        </ButtonBase>
                    </Box>
                </CardBase>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: { xs: 3, md: 5 }, mb: { xs: 2, md: 0 }, pt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sponsoredBy")}
                </Typography>
                <LogoGA />
            </Box>
        </Box>
    );
}
