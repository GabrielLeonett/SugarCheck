import { Box, CircularProgress, Typography } from "@mui/material";
import { Logo } from "./Logo";

export function LoadingScreen({ message = "Cargando..." }: { message?: string }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 3,
                bgcolor: 'background.default',
            }}
        >
            <Box sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                <Logo />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                SugarCheck
            </Typography>
            <CircularProgress size={32} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {message}
            </Typography>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
        </Box>
    );
}
