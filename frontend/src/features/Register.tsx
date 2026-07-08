import { useState } from 'react';
import { Box, useTheme, Typography, TextField, Button, Link, Grid, MenuItem, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
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

type RegisterFormData = {
  username: string;
  nombre: string;
  edad: string;
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
  edad: '',
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
  const [activeStep, setActiveStep] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
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
      const fechaNacimiento = new Date();
      fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - parseInt(values.edad || '0'));

      await apiPublic.post('/user/register', {
        username: values.username,
        email: values.email || undefined,
        sexo: values.sexo,
        fechaNacimiento: fechaNacimiento.toISOString(),
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
        const message = axiosError.response?.data?.message || 'Error al registrar usuario';

        if (axiosError.response?.status === 409) {
          setError('email', { message: 'Este correo electrónico ya está registrado' });
        }
        setAuthError(message);
      } else {
        setAuthError('Error al registrar usuario');
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
              Crear cuenta
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Ingresa tus credenciales para acceder
            </Typography>

            <TextField
              {...register("username")}
              fullWidth
              label="Nombre de usuario"
              variant="outlined"
              size="small"
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("nombre")}
              fullWidth
              label="Nombre completo (opcional)"
              variant="outlined"
              size="small"
              sx={textFieldStyles}
            />

            <TextField
              fullWidth
              label="Edad"
              variant="outlined"
              size="small"
              type="number"
              {...register("edad")}
              sx={textFieldStyles}
            />

            <TextField
              {...register("sexo")}
              fullWidth
              label="Sexo"
              variant="outlined"
              size="small"
              select
              error={!!errors.sexo}
              helperText={errors.sexo?.message}
              sx={textFieldStyles}
            >
              <MenuItem value="masculino">Masculino</MenuItem>
              <MenuItem value="femenino">Femenino</MenuItem>
            </TextField>

            <TextField
              {...register("email")}
              fullWidth
              label="Correo electrónico (opcional)"
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
              label="Contraseña"
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
              label="Confirmar contraseña"
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
              Configuración de Salud
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Prepara tus Estadísticas
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  {...register("peso")}
                  fullWidth
                  label="Peso (Kg)"
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
                  label="Talla (cm)"
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
              Rango objetivo de Glucosa
            </Typography>

            <Grid spacing={2} container sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  {...register("glucosaMin")}
                  fullWidth
                  label="Mínimo"
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
                  label="Máximo"
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
              Contactos de Emergencia
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Convoca a tus Guardianes
            </Typography>

            <TextField
              {...register("nombreGuardián")}
              fullWidth
              label="Nombre del Familiar"
              variant="outlined"
              size="small"
              error={!!errors.nombreGuardián}
              helperText={errors.nombreGuardián?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("parentesco")}
              fullWidth
              label="Parentesco"
              variant="outlined"
              size="small"
              select
              error={!!errors.parentesco}
              helperText={errors.parentesco?.message}
              sx={textFieldStyles}
            >
              <MenuItem value="madre">Madre</MenuItem>
              <MenuItem value="padre">Padre</MenuItem>
              <MenuItem value="hermano">Hermano</MenuItem>
              <MenuItem value="hermana">Hermana</MenuItem>
              <MenuItem value="abuelo">Abuelo</MenuItem>
              <MenuItem value="abuela">Abuela</MenuItem>
              <MenuItem value="tio">Tío</MenuItem>
              <MenuItem value="tia">Tía</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>

            <TextField
              {...register("telefono")}
              fullWidth
              label="Teléfono"
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
          title: '¡Únete a la batalla, Guerrero!',
          description: 'Estás a unos pocos pasos de iniciar tu gran viaje. Registra tus datos básicos para forjar tu perfil en nuestra orden.'
        };
      case 1:
        return {
          title: 'Prepara tus Estadísticas',
          description: 'Para ayudarte a mantenerte en la Zona Segura y calcular tu evolución física, necesitamos conocer tu estado de batalla actual.'
        };
      case 2:
        return {
          title: 'Convoca a tus Guardianes',
          description: 'Ningún guerrero lucha solo. Añade a tus contactos de emergencia para que te acompañen y te cuiden en cada misión.'
        };
      default:
        return {
          title: '¡Únete a la batalla, Guerrero!',
          description: 'Completa todos los pasos para unirte a nuestra orden.'
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
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center',
        alignItems: 'stretch',
        maxWidth: '1000px',
        width: '100%'
      }}>
        <CardBase sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          textAlign: 'center',
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            {leftContent.title}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
            {leftContent.description}
          </Typography>
          <Typography variant="body2" sx={{ mt: 'auto' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
              Iniciar sesión
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
          p: 2,
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
                Atrás
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
                {activeStep === 2 ? 'Finalizar Registro' : 'Siguiente Paso'}
              </Button>
            </Box>
          </Box>
        </CardBase>
      </Box>

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
