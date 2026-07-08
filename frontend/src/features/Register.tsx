import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Box, useTheme, Typography, TextField, Button, Link, Grid, MenuItem } from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";
import LoginIcon from '@mui/icons-material/Login';
import { CardBase } from '../components/ui/Cards/CardBase';

export default function Register() {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    // Estado central del formulario: almacena los datos ingresados en cada paso para poder validarlos y enviarlos después.
    const [formData, setFormData] = useState({
        // Paso 1: Crear cuenta
        nombre: '',
        edad: '',
        sexo: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Paso 2: Configuración de salud
        peso: '',
        talla: '',
        glucosaMin: '',
        glucosaMax: '',
        // Paso 3: Contacto de confianza
        nombreGuardián: '',
        parentesco: '',
        telefono: ''
    });
    // Estado de errores: guarda los mensajes por campo para mostrar validaciones en tiempo real y por paso.
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Paso 1: valida credenciales básicas, rango de edad y concordancia de contraseñas.
    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        const edad = Number(formData.edad);

        if (!formData.nombre) {
            newErrors.nombre = 'Nombre es requerido';
        } else {
            const nombreError = validateTextFieldValue(formData.nombre);
            if (nombreError) newErrors.nombre = nombreError;
        }

        if (!formData.edad) {
            newErrors.edad = 'Edad es requerida';
        } else if (isNaN(edad) || edad < 1 || edad > 100) {
            newErrors.edad = 'Edad debe estar entre 1 y 100 años';
        }

        if (!formData.sexo) {
            newErrors.sexo = 'Sexo es requerido';
        }

        if (!formData.email) {
            newErrors.email = 'Correo electrónico es requerido';
        } else {
            const emailError = validateEmail(formData.email);
            if (emailError) newErrors.email = emailError;
        }

        if (!formData.password) {
            newErrors.password = 'Contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmar contraseña es requerido';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Paso 2: valida rangos de salud con límites coherentes para peso, talla y glucosa.
    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        const peso = Number(formData.peso);
        const talla = Number(formData.talla);
        const glucosaMin = Number(formData.glucosaMin);
        const glucosaMax = Number(formData.glucosaMax);

        if (!formData.peso) newErrors.peso = 'Peso es requerido';
        else if (isNaN(peso) || peso < 1 || peso > 250) newErrors.peso = 'Peso debe estar entre 1 y 250 kg';

        if (!formData.talla) newErrors.talla = 'Talla es requerida';
        else if (isNaN(talla) || talla < 30 || talla > 250) newErrors.talla = 'Talla debe estar entre 30 y 250 cm';

        if (!formData.glucosaMin) newErrors.glucosaMin = 'Glucosa mínima es requerida';
        else if (isNaN(glucosaMin) || glucosaMin <= 1 || glucosaMin >= 600) newErrors.glucosaMin = 'Glucosa mínima debe estar entre 2 y 599 mg/dL';

        if (!formData.glucosaMax) newErrors.glucosaMax = 'Glucosa máxima es requerida';
        else if (isNaN(glucosaMax) || glucosaMax <= 1 || glucosaMax >= 600) newErrors.glucosaMax = 'Glucosa máxima debe estar entre 2 y 599 mg/dL';

        if (!newErrors.glucosaMin && !newErrors.glucosaMax && glucosaMax <= glucosaMin) {
            newErrors.glucosaMax = 'Glucosa máxima debe ser mayor que la mínima';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Paso 3: valida el contacto de emergencia; el teléfono usa una regex específica para números venezolanos.
    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        const nombreGuardiánError = formData.nombreGuardián ? validateTextFieldValue(formData.nombreGuardián) : 'Nombre del guardián es requerido';
        const parentescoError = formData.parentesco ? validateTextFieldValue(formData.parentesco) : 'Parentesco es requerido';
        const telefonoError = validatePhoneValue(formData.telefono);

        if (nombreGuardiánError) newErrors.nombreGuardián = nombreGuardiánError;
        if (parentescoError) newErrors.parentesco = parentescoError;
        if (telefonoError) newErrors.telefono = telefonoError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;
        if (activeStep === 0) isValid = validateStep1();
        else if (activeStep === 1) isValid = validateStep2();
        else isValid = validateStep3();

        if (isValid && activeStep < 2) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        if (validateStep3()) {
            console.log('Formulario completo:', formData);
            alert('Registro completado exitosamente!');
        }
    };

    const validateTextFieldValue = (value: string) => {
        if (/\d/.test(value)) return 'Este campo no puede contener números';
        if (value.trim().length > 0 && value.trim().length < 3) return 'Debe tener al menos 3 caracteres';
        if (value.trim().length > 50) return 'Debe tener máximo 50 caracteres';
        return '';
    };

    const validateEmail = (email: string) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return 'Correo electrónico es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmedEmail) ? '' : 'Correo electrónico inválido';
    };

    const validatePhoneValue = (value: string) => {
        const phone = value.trim();
        if (!phone) return 'Teléfono es requerido';
        if (!/^((\+?58)?(0412|0414|0424|0416|0426|0212)\d{7})$/.test(phone)) return 'Número de teléfono inválido';
        return '';
    };

    const handleTextFieldChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const newErrors = { ...errors };
        const error = validateTextFieldValue(value);

        if (error) {
            newErrors[field] = error;
        } else {
            delete newErrors[field];
        }

        setFormData({ ...formData, [field]: value });
        setErrors(newErrors);
    };

    const handleNumberFieldChange = (
        field: string,
        min: number,
        max: number,
        invalidMessage: string,
        requiredMessage = 'Este campo es requerido',
    ) => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const numericValue = Number(value);
        const newErrors = { ...errors };

        if (!value) {
            newErrors[field] = requiredMessage;
        } else if (isNaN(numericValue) || numericValue < min || numericValue > max) {
            newErrors[field] = invalidMessage;
        } else {
            delete newErrors[field];
        }

        setFormData({ ...formData, [field]: value });
        setErrors(newErrors);
    };

    // Actualiza el valor del campo y limpia su error al mismo tiempo cuando el input queda válido.
    const handleChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const newErrors = { ...errors };

        if (!value.trim()) {
            newErrors[field] = 'Este campo es requerido';
        } else {
            delete newErrors[field];
        }

        setFormData({ ...formData, [field]: value });
        setErrors(newErrors);
    };

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const newErrors = { ...errors };
        const error = validatePhoneValue(value);

        if (error) {
            newErrors.telefono = error;
        } else {
            delete newErrors.telefono;
        }

        setFormData({ ...formData, telefono: value });
        setErrors(newErrors);
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
                            fullWidth
                            label="Nombre"
                            variant="outlined"
                            size="small"
                            value={formData.nombre}
                            onChange={handleTextFieldChange('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                            sx={textFieldStyles}
                        />

                        <TextField
                            fullWidth
                            label="Edad"
                            variant="outlined"
                            size="small"
                            type="number"
                            value={formData.edad}
                            onChange={handleNumberFieldChange('edad', 1, 100, 'Edad debe estar entre 1 y 100 años', 'Edad es requerida')}
                            error={!!errors.edad}
                            helperText={errors.edad}
                            sx={textFieldStyles}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Sexo"
                            variant="outlined"
                            size="small"
                            value={formData.sexo}
                            onChange={handleChange('sexo')}
                            error={!!errors.sexo}
                            helperText={errors.sexo}
                            sx={textFieldStyles}
                        >
                            <MenuItem value="Masculino">Masculino</MenuItem>
                            <MenuItem value="Femenino">Femenino</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Correo electrónico"
                            variant="outlined"
                            size="small"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            error={!!errors.email}
                            helperText={errors.email}
                            sx={textFieldStyles}
                        />

                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            variant="outlined"
                            size="small"
                            value={formData.password}
                            onChange={handleChange('password')}
                            error={!!errors.password}
                            helperText={errors.password}
                            sx={textFieldStyles}
                        />

                        <TextField
                            fullWidth
                            label="Confirmar contraseña"
                            type="password"
                            variant="outlined"
                            size="small"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
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

                        {/* Peso y Talla en dos columnas */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="Peso (Kg)"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={formData.peso}
                                    onChange={handleNumberFieldChange('peso', 1, 250, 'Peso debe estar entre 1 y 250 kg', 'Peso es requerido')}
                                    error={!!errors.peso}
                                    helperText={errors.peso}
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="Talla (cm)"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={formData.talla}
                                    onChange={handleNumberFieldChange('talla', 30, 250, 'Talla debe estar entre 30 y 250 cm', 'Talla es requerida')}
                                    error={!!errors.talla}
                                    helperText={errors.talla}
                                    sx={textFieldStyles}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, textAlign: 'left' }}>
                            Rango objetivo de Glucosa
                        </Typography>

                        {/* Mínimo y Máximo en dos columnas */}
                        <Grid spacing={2} container sx={{ mb: 2 }}>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="Mínimo"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={formData.glucosaMin}
                                    onChange={handleNumberFieldChange('glucosaMin', 2, 599, 'Glucosa mínima debe estar entre 2 y 599 mg/dL', 'Glucosa mínima es requerida')}
                                    error={!!errors.glucosaMin}
                                    helperText={errors.glucosaMin}
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="Máximo"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={formData.glucosaMax}
                                    onChange={handleNumberFieldChange('glucosaMax', 2, 599, 'Glucosa máxima debe estar entre 2 y 599 mg/dL', 'Glucosa máxima es requerida')}
                                    error={!!errors.glucosaMax}
                                    helperText={errors.glucosaMax}
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
                            Contactos de Confianza
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                            Convoca a tus Guardianes
                        </Typography>

                        <TextField
                            fullWidth
                            label="Nombre del Guardián"
                            variant="outlined"
                            size="small"
                            value={formData.nombreGuardián}
                            onChange={handleTextFieldChange('nombreGuardián')}
                            error={!!errors.nombreGuardián}
                            helperText={errors.nombreGuardián}
                            sx={textFieldStyles}
                        />

                        <TextField
                            fullWidth
                            label="Parentesco"
                            variant="outlined"
                            size="small"
                            value={formData.parentesco}
                            onChange={handleTextFieldChange('parentesco')}
                            error={!!errors.parentesco}
                            helperText={errors.parentesco}
                            sx={textFieldStyles}
                        />

                        <TextField
                            fullWidth
                            label="Teléfono"
                            variant="outlined"
                            size="small"
                            type="tel"
                            value={formData.telefono}
                            onChange={handlePhoneChange}
                            error={!!errors.telefono}
                            helperText={errors.telefono}
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
                    description: 'Estás a unos pocos pasos de iniciar tu gran viaje. Registra tus datos básicos para forjar tu perfil en nuestra orden.',
                    align: 'center'
                };
            case 1:
                return {
                    title: 'Prepara tus Estadísticas',
                    description: 'Para ayudarte a mantenerte en la Zona Segura y calcular tu evolución física, necesitamos conocer tu estado de batalla actual.',
                    align: 'center'
                };
            case 2:
                return {
                    title: 'Convoca a tus Guardianes',
                    description: 'Ningún guerrero lucha solo. Añade a tus contactos de confianza para que te acompañen y te cuiden en cada misión.',
                    align: 'center'
                };
            default:
                return {
                    title: '¡Únete a la batalla, Guerrero!',
                    description: 'Completa todos los pasos para unirte a nuestra orden.',
                    align: 'center'
                };
        }
    };

    const leftContent = getLeftContent();

    return (
        <Box sx={{ 
            minHeight: '100vh',
            mt: 4,
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
                {/* Columna izquierda - Mensajes dinámicos */}
                <CardBase sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    textAlign: 'center',
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: leftContent.align }}>
                        {leftContent.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4, textAlign: leftContent.align }}>
                        {leftContent.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 'auto' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                            Iniciar sesión
                        </Link>
                    </Typography>
                </CardBase>

                {/* Columna derecha - Formulario dinámico */}
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
                        {getStepContent()}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            {activeStep !== 0 && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleBack}
                                    sx={{
                                        py: 1,
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                                    }}
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={activeStep === 2 ? handleSubmit : handleNext}
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

            {/* Footer */}
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