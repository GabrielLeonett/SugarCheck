import { Box, Typography, alpha, useTheme } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import useLanguage from "../../../hooks/useLanguage";

interface SeparadorMundoProps {
    texto: string;
    numero: string | number;
    /** Mantiene la compatibilidad con la versión anterior del componente. */
    bool?: boolean;
    /** Color de acento del mundo. */
    accent?: string;
    /** Icono representativo del mundo. */
    Icon?: SvgIconComponent;
    /** Niveles completados dentro del mundo. */
    completados?: number;
    /** Total de niveles del mundo. */
    total?: number;
}

function SeparadorMundo({
    texto = "Tierras de la Energía",
    numero = "1",
    bool = true,
    accent,
    Icon,
    completados = 0,
    total = 3,
}: SeparadorMundoProps) {
    const { t } = useLanguage("camino");
    const theme = useTheme();
    const color = accent ?? theme.palette.primary.main;
    const mundoCompletado = total > 0 && completados >= total;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 2.5 },
                position: "relative",
                zIndex: 2,
                opacity: bool ? 1 : 0.65,
            }}
        >
            <Box
                sx={{
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    borderRadius: 2.5,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.18 : 0.1),
                    border: "1px solid",
                    borderColor: alpha(color, 0.28),
                }}
            >
                {Icon ? <Icon sx={{ fontSize: { xs: 23, sm: 26 } }} /> : String(numero)}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    variant="overline"
                    sx={{ color, fontWeight: 700, letterSpacing: 2, lineHeight: 1.4, display: "block" }}
                >
                    {t("world")} {numero}
                </Typography>
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        color: "text.primary",
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                        lineHeight: 1.25,
                    }}
                >
                    {texto}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    {Array.from({ length: total }).map((_, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: idx < completados ? color : alpha(color, 0.22),
                                transition: "background-color 0.3s ease",
                            }}
                        />
                    ))}
                </Box>
                <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600, minWidth: 28, textAlign: "right" }}
                >
                    {completados}/{total}
                </Typography>
                {mundoCompletado && (
                    <CheckCircleRounded
                        sx={{ fontSize: 16, color }}
                        titleAccess={t("levelsCompleted")}
                    />
                )}
            </Box>
        </Box>
    );
}

export default SeparadorMundo;
