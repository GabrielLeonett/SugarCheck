import { Box, Tooltip, Typography, alpha, useTheme } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import type { KeyboardEvent } from "react";
import { leccionesPorNivel } from "./contenidoData";
import useLanguage from "../../../hooks/useLanguage";

interface HexagonoMundoProps {
    numero?: number | string;
    /** Nivel completado. */
    color?: boolean;
    size?: number;
    /** Dibuja el conector hacia el siguiente nivel. */
    lines?: boolean;
    onClick?: () => void;
    /** El nivel está bloqueado y no se puede abrir. */
    bloqueado?: boolean;
    /** Nivel desbloqueado pendiente (el siguiente por jugar). */
    actual?: boolean;
    /** Color de acento del mundo. */
    accent?: string;
}

export function HexagonoMundo({
    color = false,
    size = 76,
    numero = 0,
    lines = false,
    onClick,
    bloqueado = true,
    actual = false,
    accent,
}: HexagonoMundoProps) {
    const { t } = useLanguage("camino");
    const theme = useTheme();
    const num = Number(numero);
    const esPar = num % 2 === 0;
    const leccionData = leccionesPorNivel[num];
    const tituloMision = leccionData?.titulo || "";
    const tituloTraducido = t(`level${num}Title`);
    const titulo = tituloTraducido !== `level${num}Title` ? tituloTraducido : tituloMision;
    const acento = accent ?? theme.palette.primary.main;
    const bloqueadoVisual = bloqueado && !color;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (bloqueado || !onClick) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    };

    const tooltipContent = (
        <Box>
            <Typography
                variant="overline"
                sx={{ display: "block", lineHeight: 1.5, color: "primary.main", fontWeight: 700 }}
            >
                {bloqueadoVisual ? t("lockedLabel") : t("mission")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {bloqueadoVisual ? t("lockedLevel") : titulo}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: { xs: 1.5, md: 2.25 },
                transform: {
                    xs: "none",
                    md: esPar ? "translateX(-64px)" : "translateX(64px)",
                },
                transition: "transform 0.3s ease-in-out",
            }}
        >
            <Tooltip
                title={tooltipContent}
                arrow
                placement="top"
                slotProps={{
                    tooltip: {
                        sx: {
                            bgcolor: "background.paper",
                            color: "text.primary",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: 3,
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                            maxWidth: 250,
                        },
                    },
                    arrow: {
                        sx: {
                            color: "background.paper",
                            "&::before": {
                                border: "1px solid",
                                borderColor: "divider",
                            },
                        },
                    },
                }}
            >
                <Box
                    role="button"
                    tabIndex={bloqueadoVisual ? -1 : 0}
                    aria-label={titulo}
                    aria-disabled={bloqueadoVisual}
                    onClick={() => {
                        if (bloqueadoVisual) return;
                        onClick?.();
                    }}
                    onKeyDown={handleKeyDown}
                    sx={{
                        position: "relative",
                        width: size,
                        height: size,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: bloqueadoVisual ? "not-allowed" : "pointer",
                        borderRadius: "50%",
                        outline: "none",
                        "&:focus-visible": {
                            boxShadow: `0 0 0 4px ${alpha(acento, 0.35)}`,
                        },
                    }}
                >
                    {/* Conector punteado hacia el siguiente nivel */}
                    {lines && (
                        <Box
                            component="svg"
                            aria-hidden="true"
                            sx={{
                                position: "absolute",
                                top: size / 2,
                                left: esPar ? size / 2 : "auto",
                                right: esPar ? "auto" : size / 2,
                                width: 120,
                                height: 90,
                                overflow: "visible",
                                zIndex: 0,
                                pointerEvents: "none",
                                display: { xs: "none", md: "block" },
                            }}
                        >
                            <line
                                x1={esPar ? 0 : 120}
                                y1={0}
                                x2={esPar ? 120 : 0}
                                y2={90}
                                stroke={acento}
                                strokeOpacity={0.35}
                                strokeWidth={3}
                                strokeDasharray="3 9"
                                strokeLinecap="round"
                            />
                        </Box>
                    )}

                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "transform 0.25s ease, filter 0.25s ease",
                            filter: bloqueadoVisual ? "grayscale(0.7)" : "none",
                            opacity: bloqueadoVisual ? 0.8 : 1,
                            "&:hover": {
                                transform: bloqueadoVisual ? "none" : "translateY(-4px)",
                            },
                            ...(actual && {
                                animation: "caminoLatido 2.6s ease-in-out infinite",
                                "@keyframes caminoLatido": {
                                    "0%, 100%": { filter: `drop-shadow(0 0 0 ${alpha(acento, 0)})` },
                                    "50%": { filter: `drop-shadow(0 0 12px ${alpha(acento, 0.55)})` },
                                },
                            }),
                        }}
                    >
                        <Box
                            component="svg"
                            viewBox="0 0 100 100"
                            width="100%"
                            height="100%"
                            aria-hidden="true"
                            sx={{ position: "absolute", inset: 0 }}
                        >
                            <defs>
                                <linearGradient id={`hexFill-${num}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={alpha(acento, 1)} />
                                    <stop offset="100%" stopColor={alpha(acento, 0.72)} />
                                </linearGradient>
                            </defs>
                            <polygon
                                points="50,5 95,25 95,75 50,95 5,75 5,25"
                                fill={
                                    color
                                        ? `url(#hexFill-${num})`
                                        : bloqueadoVisual
                                            ? alpha(theme.palette.text.disabled, 0.16)
                                            : theme.palette.background.paper
                                }
                                stroke={
                                    color || actual
                                        ? acento
                                        : bloqueadoVisual
                                            ? theme.palette.divider
                                            : alpha(acento, 0.55)
                                }
                                strokeWidth={actual ? 5 : 4}
                                strokeLinejoin="round"
                            />
                        </Box>

                        {color ? (
                            <CheckRoundedIcon
                                sx={{
                                    position: "relative",
                                    zIndex: 2,
                                    color: theme.palette.getContrastText(acento),
                                    fontSize: size * 0.42,
                                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                                }}
                            />
                        ) : bloqueadoVisual ? (
                            <LockRoundedIcon
                                sx={{ position: "relative", zIndex: 2, color: "text.disabled", fontSize: size * 0.34 }}
                            />
                        ) : (
                            <Typography
                                variant="body1"
                                sx={{
                                    position: "relative",
                                    zIndex: 2,
                                    color: acento,
                                    fontWeight: 800,
                                    fontSize: `${size * 0.34}px`,
                                    userSelect: "none",
                                    lineHeight: 1,
                                }}
                            >
                                {numero}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Tooltip>

            <Typography
                variant="caption"
                sx={{
                    mt: 0.75,
                    color: actual ? acento : "text.secondary",
                    fontWeight: actual ? 700 : 500,
                    letterSpacing: 0.4,
                    fontSize: { xs: "0.68rem", sm: "0.74rem" },
                }}
            >
                {t("level")} {numero}
            </Typography>
        </Box>
    );
}
