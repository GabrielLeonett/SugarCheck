import { Box, alpha, useTheme } from "@mui/material";
import SeparadorMundo from "./SeparaMundos";
import WorldDecor from "./WorldDecor";
import { HexagonoMundo } from "./NivelesHexagono";
import { getWorldTheme, worldAccent } from "./worldTheme";

export interface MundoNivel {
    numero: number;
    color: boolean;
    lines: boolean;
    bloqueado: boolean;
}

export interface MundoData {
    id: string;
    numeroMundo: string;
    tituloSeparador: string;
    tituloSeparadorKey: string;
    bloqueado: boolean;
    niveles: MundoNivel[];
}

interface WorldCardProps {
    mundo: MundoData;
    /** Título del mundo ya traducido. */
    titulo: string;
    onSelectNivel: (numero: number) => void;
}

export default function WorldCard({ mundo, titulo, onSelectNivel }: WorldCardProps) {
    const theme = useTheme();
    const worldTheme = getWorldTheme(mundo.numeroMundo);
    const accent = worldAccent(worldTheme, theme.palette.mode);
    const completados = mundo.niveles.filter((nivel) => nivel.color).length;

    return (
        <Box
            component="section"
            aria-labelledby={`mundo-${mundo.numeroMundo}`}
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? alpha(accent, 0.18) : alpha(accent, 0.16),
                bgcolor: "background.paper",
                backgroundImage:
                    theme.palette.mode === "dark"
                        ? `linear-gradient(135deg, ${alpha(accent, 0.1)} 0%, transparent 60%)`
                        : `linear-gradient(135deg, ${alpha(accent, 0.09)} 0%, transparent 58%)`,
                boxShadow:
                    theme.palette.mode === "dark"
                        ? "0 10px 30px rgba(0,0,0,0.22)"
                        : "0 10px 30px rgba(42, 71, 94, 0.07)",
                transition: "box-shadow 0.25s ease, border-color 0.25s ease",
                "&:hover": {
                    borderColor: alpha(accent, 0.32),
                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 16px 38px rgba(0,0,0,0.32)"
                            : "0 16px 38px rgba(42, 71, 94, 0.11)",
                },
            }}
        >
            <WorldDecor world={mundo.numeroMundo} accent={accent} />

            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box id={`mundo-${mundo.numeroMundo}`}>
                    <SeparadorMundo
                        numero={mundo.numeroMundo}
                        texto={titulo}
                        bool={!mundo.bloqueado}
                        accent={accent}
                        Icon={worldTheme.Icon}
                        completados={completados}
                        total={mundo.niveles.length}
                    />
                </Box>

                <Box
                    sx={{
                        height: "1px",
                        mx: { xs: 2, sm: 3 },
                        background: `linear-gradient(90deg, transparent, ${alpha(accent, 0.28)}, transparent)`,
                    }}
                />

                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        px: { xs: 1, sm: 2 },
                        pt: 1.5,
                        pb: 3,
                        "&::before": {
                            content: '""',
                            display: { xs: "block", md: "none" },
                            position: "absolute",
                            top: 46,
                            bottom: 46,
                            left: "50%",
                            width: 0,
                            borderLeft: "2px dashed",
                            borderColor: alpha(accent, 0.25),
                            transform: "translateX(-50%)",
                            zIndex: 0,
                        },
                    }}
                >
                    {mundo.niveles.map((nivel, idx) => (
                        <HexagonoMundo
                            key={nivel.numero}
                            numero={nivel.numero}
                            lines={idx < mundo.niveles.length - 1}
                            color={nivel.color}
                            bloqueado={!nivel.bloqueado}
                            actual={!nivel.color && nivel.bloqueado}
                            accent={accent}
                            onClick={() => {
                                if (!nivel.bloqueado) return;
                                onSelectNivel(Number(nivel.numero));
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
