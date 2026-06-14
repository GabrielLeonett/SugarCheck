import { useState } from 'react';
import { Box, useTheme, Typography, Button, Link} from "@mui/material";
import { LogoGA } from "../components/ui/LogoGA";

export default function Register() {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);


    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
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
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%',
                maxWidth: '1000px',
                mb: 4
            }}>
            </Box>

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
                    minHeight: '550px',
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 'auto' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                            Iniciar sesión
                        </Link>
                    </Typography>
                </Box>

                {/* Columna derecha - Formulario dinámico */}
                <Box sx={{
                    flex: 1,
                    bgcolor: theme.palette.primary.dark,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    minHeight: '550px',
                }}>
                    <Box sx={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleBack}
                                disabled={activeStep === 0}
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
                </Box>
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