import { Box, Typography, alpha, useTheme } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import useLanguage from "../../../hooks/useLanguage";

interface InsigniaCardProps {
    img: string;
    name: string;
    mundo: string;
    bloqueado: boolean;
}

function InsigniaCard({ img, name, mundo, bloqueado = false }: InsigniaCardProps) {
    const { t } = useLanguage("camino");
    const theme = useTheme();
    const color = theme.palette.primary.main;

    return (
        <Box
            component="section"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: bloqueado ? "divider" : alpha(color, 0.28),
                bgcolor: bloqueado
                    ? "action.hover"
                    : alpha(color, theme.palette.mode === "dark" ? 0.08 : 0.05),
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                    transform: bloqueado ? "none" : "translateY(-2px)",
                    boxShadow: bloqueado ? "none" : `0 8px 18px ${alpha(color, 0.18)}`,
                    borderColor: bloqueado ? "divider" : alpha(color, 0.5),
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0.75,
                    bgcolor: bloqueado
                        ? alpha(theme.palette.text.disabled, 0.1)
                        : alpha(color, theme.palette.mode === "dark" ? 0.2 : 0.14),
                    border: "1px solid",
                    borderColor: bloqueado ? "divider" : alpha(color, 0.3),
                }}
            >
                <Box
                    component="img"
                    src={img}
                    alt={name}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        filter: bloqueado ? "grayscale(100%) opacity(45%)" : "none",
                    }}
                />
                {bloqueado && (
                    <Box
                        sx={{
                            position: "absolute",
                            right: -4,
                            bottom: -4,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            color: "text.disabled",
                        }}
                    >
                        <LockRoundedIcon sx={{ fontSize: 13 }} />
                    </Box>
                )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        color: bloqueado ? "text.disabled" : "text.primary",
                        lineHeight: 1.3,
                    }}
                >
                    {t(name) !== name ? t(name) : name}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        mt: 0.25,
                        fontWeight: 600,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: bloqueado ? "text.disabled" : color,
                    }}
                >
                    {t(mundo) !== mundo ? t(mundo) : mundo}
                </Typography>
            </Box>
        </Box>
    );
}

export default InsigniaCard;
