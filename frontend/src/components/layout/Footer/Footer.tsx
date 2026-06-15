import { Box, Typography, Divider, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Footer() {
    const { t } = useTranslation("footer");
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const links = [
        { label: t('privacidad'), path: '/privacidad' },
        { label: t('terminos'), path: '/terminos' },
        { label: t('soporte'), path: '/soporte' },
        { label: t('version'), path: '#' }
    ];
    return (
        <Box
            component="footer"
            sx={{
                py: 4,
                px: 2,
                bgcolor: 'primary.dark',
                color: 'white',
                mt: 'auto',
                display: "flex",
                flexDirection: 'column',
                justifyItems: 'center',
                alignItems: 'center',
            }}
        >
            {/* Links de navegación */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                divider={<Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />}
                spacing={2}
                sx={{ alignItems: 'center', mb: 2 }}
            >
                {links.map((link) => (
                    <Typography
                        key={link.label}
                        variant="body2"
                        onClick={() => navigate(link.path)}
                        sx={{ cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                        {link.label}
                    </Typography>
                ))}
            </Stack>

            <Typography variant="caption" sx={{ opacity: 0.5 }}>
                &copy; {currentYear} SugarCheck. {t('rights')}
            </Typography>
        </Box>
    );
}