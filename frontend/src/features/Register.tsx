import { useState } from 'react';
import { Box, useTheme, Typography, TextField, Button, Link, Grid, MenuItem, Alert } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import { LogoGA } from "../components/ui/LogoGA";
import LoginIcon from '@mui/icons-material/Login';
import { CardBase } from '../components/ui/Cards/CardBase';
import { apiPublic } from '../apis/axios';
import { contactEmergenceApi } from '../apis/contact_emergence';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { BackendErrorResponse } from '../types/types';
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
} from '../schemas/register';
import useLanguage from "../hooks/useLanguage";

type RegisterFormData = {
  username: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: '' | 'masculino' | 'femenino';
  email: string;
  password: string;
  confirmPassword: string;
  peso: string;
  talla: string;
  glucosaMin: string;
  glucosaMax: string;
  nombreGuardián: string;
  parentesco: '' | 'madre' | 'padre' | 'hermano' | 'hermana' | 'abuelo' | 'abuela' | 'tio' | 'tia' | 'tutor' | 'otro';
  telefono: string;
};

const defaultValues: RegisterFormData = {
  username: '',
  nombre: '',
  fechaNacimiento: '',
  sexo: '',
  email: '',
  password: '',
  confirmPassword: '',
  peso: '',
  talla: '',
  glucosaMin: '',
  glucosaMax: '',
  nombreGuardián: '',
  parentesco: '',
  telefono: '',
};

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t } = useLanguage("register");
  const [activeStep, setActiveStep] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues,
  });

  const stepSchemas = [registerStep1Schema, registerStep2Schema, registerStep3Schema];

  const validateStep = (step: number): boolean => {
    const values = getValues();
    const schema = stepSchemas[step];
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof RegisterFormData, { message: messages[0] });
        }
      }
      return false;
    }
    clearErrors();
    return true;
  };

  const handleNext = () => {
    const valid = validateStep(activeStep);
    if (valid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async () => {
    const values = getValues();
    const result = registerStep3Schema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof RegisterFormData, { message: messages[0] });
        }
      }
      return;
    }

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

      await contactEmergenceApi.create({
        name: values.nombreGuardián,
        parentesco: values.parentesco,
        telefono: values.telefono || undefined,
      });

      navigate('/');
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

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
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
          </>
        );

      case 1:
        return (
          <>
            <LoginIcon sx={{ fontSize: 50, color: 'white', mb: 1 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              {t("healthTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
{t("healthSubtitle")}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  {...register("peso")}
                  fullWidth
                  label={t("weightLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.peso}
                  helperText={errors.peso?.message}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  {...register("talla")}
                  fullWidth
                  label={t("heightLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.talla}
                  helperText={errors.talla?.message}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, textAlign: 'left' }}>
              {t("glucoseRangeTitle")}
            </Typography>

            <Grid spacing={2} container sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  {...register("glucosaMin")}
                  fullWidth
                  label={t("glucoseMinLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.glucosaMin}
                  helperText={errors.glucosaMin?.message}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  {...register("glucosaMax")}
                  fullWidth
                  label={t("glucoseMaxLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.glucosaMax}
                  helperText={errors.glucosaMax?.message}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </>
        );

      case 2:
        return (
          <>
            <LoginIcon sx={{ fontSize: 50, color: 'white', mb: 1 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              {t("emergencyTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
{t("emergencySubtitle")}
            </Typography>

            <TextField
              {...register("nombreGuardián")}
              fullWidth
              label={t("guardianNameLabel")}
              variant="outlined"
              size="small"
              error={!!errors.nombreGuardián}
              helperText={errors.nombreGuardián?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("parentesco")}
              fullWidth
              label={t("relationshipLabel")}
              variant="outlined"
              size="small"
              select
              error={!!errors.parentesco}
              helperText={errors.parentesco?.message}
              sx={textFieldStyles}
            >
              <MenuItem value="madre">{t("relationshipMother")}</MenuItem>
              <MenuItem value="padre">{t("relationshipFather")}</MenuItem>
              <MenuItem value="hermano">{t("relationshipBrother")}</MenuItem>
              <MenuItem value="hermana">{t("relationshipSister")}</MenuItem>
              <MenuItem value="abuelo">{t("relationshipGrandfather")}</MenuItem>
              <MenuItem value="abuela">{t("relationshipGrandmother")}</MenuItem>
              <MenuItem value="tio">{t("relationshipUncle")}</MenuItem>
              <MenuItem value="tia">{t("relationshipAunt")}</MenuItem>
              <MenuItem value="tutor">{t("relationshipGuardian")}</MenuItem>
              <MenuItem value="otro">{t("relationshipOther")}</MenuItem>
            </TextField>

            <TextField
              {...register("telefono")}
              fullWidth
              label={t("phoneLabel")}
              variant="outlined"
              size="small"
              type="tel"
              sx={textFieldStyles}
            />
          </>
        );

      default:
        return null;
    }
  };

  const getLeftContent = () => {
    switch (activeStep) {
      case 0:
        return {
          title: t("leftTitleStep0"),
          description: t("leftDescStep0")
        };
      case 1:
        return {
          title: t("leftTitleStep1"),
          description: t("leftDescStep1")
        };
      case 2:
        return {
          title: t("leftTitleStep2"),
          description: t("leftDescStep2")
        };
      default:
        return {
          title: t("leftTitleStep0"),
          description: t("leftDescDefault")
        };
    }
  };

  const leftContent = getLeftContent();

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
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 2 },
          textAlign: 'center',
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {leftContent.title}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
            {leftContent.description}
          </Typography>
          <Typography variant="body2" sx={{ mt: { xs: 2, md: 'auto' } }}>
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
            {getStepContent()}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || isSubmitting}
                sx={{
                  py: 1,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                  '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.3)' }
                }}
              >
                {t("backButton")}
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={activeStep === 2 ? onSubmit : handleNext}
                disabled={isSubmitting}
                sx={{
                  py: 1,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                {activeStep === 2 ? t("finishButton") : t("nextButton")}
              </Button>
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
