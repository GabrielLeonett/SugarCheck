import { useState } from 'react';
import { Box, useTheme, Typography, TextField, Link, Alert, MenuItem } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import { LogoGA } from "../components/ui/LogoGA";
import LoginIcon from '@mui/icons-material/Login';
import { CardBase } from '../components/ui/Cards/CardBase';
import { apiPublic } from '../apis/axios';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { BackendErrorResponse } from '../types/types';
import { registerStep1Schema, type RegisterStep1Data } from '../schemas/register';
import useLanguage from "../hooks/useLanguage";
import { ButtonBase } from '../components/ui/Buttons/ButtonBase';

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t } = useLanguage("register");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      username: '',
      nombre: '',
      fechaNacimiento: '',
      sexo: '' as any,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterStep1Data) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await apiPublic.post('/user/register', {
        name: values.nombre,
        username: values.username,
        email: values.email || undefined,
        sexo: values.sexo,
        fechaNacimiento: values.fechaNacimiento,
        password: values.password,
      });

      await login(values.username, values.password);

      navigate('/completar-registro');
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as AxiosError<BackendErrorResponse>;
        const message = axiosError.response?.data?.message || t("errorRegister");

        if (axiosError.response?.status === 409) {
          setError('email', { message: t("errorEmailExists") });
        }
        setAuthError(message);
      } else {
        setAuthError(t("errorRegister"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const textFieldStyles = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.1)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiFormHelperText-root': { color: '#ff6b6b' }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: theme.palette.background.default || '#f5f5f5',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, sm: 4 },
        justifyContent: 'center',
        alignItems: 'stretch',
        maxWidth: '1000px',
        width: '100%',
        px: { xs: 2, sm: 0 }
      }}>
        <CardBase sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 3, sm: 2 },
          '& .MuiCardContent-root': {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            padding: 0,
            '&:last-child': { pb: 0 },
          },
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {t("leftTitleStep0")}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
            {t("leftDescStep0")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t("hasAccount")}{' '}
            <Link href="/login" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
              {t("loginLink")}
            </Link>
          </Typography>
        </CardBase>

        <CardBase sx={{
          flex: 1,
          bgcolor: theme.palette.primary.dark,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 2 },
        }}>
          <Box sx={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            {authError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {authError}
              </Alert>
            )}

            <LoginIcon sx={{ fontSize: 50, color: 'white', mb: 1 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              {t("title")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              {t("subtitle")}
            </Typography>

            <TextField
              {...register("username")}
              fullWidth
              label={t("usernameLabel")}
              variant="outlined"
              size="small"
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("nombre")}
              fullWidth
              label={t("nameLabel")}
              variant="outlined"
              size="small"
              sx={textFieldStyles}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="fechaNacimiento"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <DateField
                    {...rest}
                    fullWidth
                    label={t("birthDateLabel")}
                    format="DD/MM/YYYY"
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue ? newValue.toISOString() : '')}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: textFieldStyles,
                        error: !!errors.fechaNacimiento,
                        helperText: errors.fechaNacimiento?.message,
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              {...register("sexo")}
              fullWidth
              label={t("sexLabel")}
              variant="outlined"
              size="small"
              select
              error={!!errors.sexo}
              helperText={errors.sexo?.message}
              sx={textFieldStyles}
            >
              <MenuItem value="masculino">{t("sexMale")}</MenuItem>
              <MenuItem value="femenino">{t("sexFemale")}</MenuItem>
            </TextField>

            <TextField
              {...register("email")}
              fullWidth
              label={t("emailLabel")}
              variant="outlined"
              size="small"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message || ''}
              sx={textFieldStyles}
            />

            <TextField
              {...register("password")}
              fullWidth
              label={t("passwordLabel")}
              type="password"
              variant="outlined"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("confirmPassword")}
              fullWidth
              label={t("confirmPasswordLabel")}
              type="password"
              variant="outlined"
              size="small"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={textFieldStyles}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <ButtonBase
                fullWidth
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                sx={{
                  py: 1,
                }}
              >
                {t("finishButton")}
              </ButtonBase>
            </Box>
          </Box>
        </CardBase>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: { xs: 3, md: 5 },
        mb: { xs: 2, md: 0 },
        pt: 2
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {t("sponsoredBy")}
        </Typography>
        <LogoGA />
      </Box>
    </Box>
  );
}
