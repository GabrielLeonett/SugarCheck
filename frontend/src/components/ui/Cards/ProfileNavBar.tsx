import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExitIcon from "@mui/icons-material/ExitToApp"; // Icono para cerrar sesión
import ChangeIcon from "@mui/icons-material/ChangeCircle"; // Icono para cerrar sesión
import React from 'react';
import { ThemeContext } from '../../../contexts/ThemeContext.tsx';
import { useAuthStore } from '../../../stores/authStore.tsx';
import LanguageSelector from '../../shared/LanguageSelector.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';
import { CardBase } from './CardBase.tsx';
interface ProfileNavBarProps {
    open?: boolean;
}

export default function ProfileNavBar({ open }: ProfileNavBarProps) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
    const { t } = useLanguage("common");
    if (!open) return null;
    return (
        <CardBase
            sx={{
                width: 320, // Un ancho fijo más común para menús tipo "popover"
                open: open ? 1 : 0,
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                position: 'absolute', // Asegúrate de posicionarlo correctamente si es un menú
                right: 16,
                top: 70,
                bgcolor: 'primary.50'
            }}
            elevation={3}
        >
            {/* Header del usuario */}
            <Box sx={{ textAlign: "center", mb: 1 }}>
                <Typography variant="subtitle1">
                    {user?.name?.toUpperCase() || "USUARIO ANÓNIMO"}
                </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Ajustes: Tema y Idioma */}
            <Stack sx={{ direction: "row", justifyContent: "space-between", alignItems: "center", px: 1, py: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{t("configuracion")}</Typography>
                <Box>
                    <IconButton onClick={toggleTheme} size="small">
                        {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                    <LanguageSelector />
                </Box>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* Acciones principales */}
            <Stack spacing={0.5} direction="row">
                {[
                    { icon: <ChangeIcon />, label: t("cambiarContrasena") },
                    { icon: <ExitIcon />, label: t("cerrarSesion"), onClick: logout },
                ].map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                            transition: "background 0.2s"
                        }}
                        onClick={item.onClick}
                    >
                        {item.icon}
                        <Typography variant="body2">{item.label}</Typography>
                    </Box>
                ))}
            </Stack>
        </CardBase>
    )
}