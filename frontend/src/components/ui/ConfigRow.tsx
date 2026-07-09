import { Stack, IconButton, Divider } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import LanguageSelector from '../shared/LanguageSelector';
import { ThemeContext } from '../../contexts/ThemeContext';
import React from 'react';


export const ConfigRow = () => {
    const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);

    return (
        <Stack
            direction="row"
            aria-label="Controles de configuración"
            spacing={1.5} // Controla el espacio uniforme entre el botón, la línea y el selector de idioma
            sx={{
                justifyContent: "center", // Centra todo el bloque si ya no hay texto a la izquierda
                alignItems: "center",
                px: 1,
                py: 0.5,
                width: '100%'
            }}
        >
            <IconButton
                onClick={toggleTheme}
                size="small"
                aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
                {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>

            {/* CORREGIDO: flexItem permite que el Divider crezca verticalmente en un entorno Flexbox */}
            <Divider orientation="vertical" flexItem />

            {/* Tu componente personalizado para cambiar de idioma */}
            <LanguageSelector />
        </Stack>
    );
};