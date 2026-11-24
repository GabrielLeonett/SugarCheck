import { useEffect, useState } from "react"
import { mundosData } from "./Components/dataWorld";
import { VistaLeccion } from "./Components/nivel"
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import {
    Box,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import InsigniaCard from "./Components/InsigniasCard";
import WorldCard from "./Components/WorldCard";
import yelmo_de_sabiduria from "../../assets/insigniasCamino/yelmo_de_sabiduria.png"
import escudo_de_fibra from "../../assets/insigniasCamino/escudo_de_fribra.png";
import lanzas from "../../assets/insigniasCamino/lanzas.png";
import imagen_8 from "../../assets/insigniasCamino/image 8.svg";
import imagen_9 from "../../assets/insigniasCamino/image 9.svg";
import { completarNivelCamino, getCaminoProgreso } from "../../apis/camino";
import useLanguage from "../../hooks/useLanguage";

const insigniasCamino = [
    { img: escudo_de_fibra, mundo: "Mundo 1", name: "Escudo de fibra" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 2", name: "Yelmo de la sabiduría" },
    { img: imagen_8, mundo: "Mundo 3", name: "Peto de Precisión" },
    { img: imagen_9, mundo: "Mundo 4", name: "Gradas de equilibrio" },
    { img: lanzas, mundo: "Mundo 5", name: "lanceta del elegido" },
]

export function Camino() {
    const { t } = useLanguage("camino");
    const theme = useTheme();

    const [mundos, setMundos] = useState(mundosData);
    const [nivelActivoId, setNivelActivoId] = useState<number | null>(null);

    useEffect(() => {
        const cargarProgreso = async () => {
            try {
                const progreso = await getCaminoProgreso();
                const ultimo = progreso.ultimoNivelCompletado || 0;
                setMundos((prevMundos) =>
                    prevMundos.map((mundo) => ({
                        ...mundo,
                        niveles: mundo.niveles.map((nivel) => {
                            const numNivel = Number(nivel.numero);
                            if (numNivel <= ultimo) {
                                return { ...nivel, color: true, bloqueado: true };
                            }
                            if (numNivel === ultimo + 1) {
                                return { ...nivel, color: false, bloqueado: true };
                            }
                            return { ...nivel, color: false, bloqueado: false };
                        }),
                    }))
                );
            } catch (error) {
                console.error(error);
            }
        };
        cargarProgreso();
    }, []);

    const totalNiveles = mundos.reduce((acc, mundo) => acc + mundo.niveles.length, 0);
    const totalNivelesCompletados = mundos.reduce((acc, mundo) => {
        const completadosMundo = mundo.niveles.filter((nivel) => nivel.color).length;
        return acc + completadosMundo;
    }, 0);

    const insigniasDesbloqueadas = Math.floor(totalNivelesCompletados / 3);
    const progresoPorcentaje = totalNiveles > 0 ? Math.round((totalNivelesCompletados / totalNiveles) * 100) : 0;
    const insigniasPorcentaje = Math.round((insigniasDesbloqueadas / insigniasCamino.length) * 100);

    const completarNivel = async (numeroNivelActual: number) => {
        try {
            await completarNivelCamino(numeroNivelActual);
        } catch (error) {
            console.error(error);
        }

        setMundos((prevMundos) =>
            prevMundos.map((mundo) => ({
                ...mundo,
                niveles: mundo.niveles.map((nivel) => {
                    const numNivel = Number(nivel.numero);

                    if (numNivel === numeroNivelActual) {
                        return { ...nivel, color: true, bloqueado: true };
                    }

                    if (numNivel === numeroNivelActual + 1) {
                        return { ...nivel, color: false, bloqueado: true };
                    }

                    return nivel;
                }),
            }))
        );

        setNivelActivoId(null);
    };

    if (nivelActivoId !== null) {
        return (
            <VistaLeccion
                nivelId={nivelActivoId}
                onCompletarExito={() => completarNivel(nivelActivoId)}
                onVolver={() => setNivelActivoId(null)}
            />
        );
    }

    return (
        <>
            <Navbar />
            <Box
                component="main"
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: "calc(100vh - 130px)",
                }}
            >
                {/* Decoración ambiental de la página */}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        backgroundImage: `radial-gradient(circle at 8% 4%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 26%),
                            radial-gradient(circle at 94% 18%, ${alpha(theme.palette.info.main, 0.12)} 0%, transparent 22%),
                            radial-gradient(circle at 60% 100%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 32%)`,
                    }}
                />

                <Box
                    sx={{
                        position: "relative",
                        maxWidth: 1240,
                        mx: "auto",
                        px: { xs: 2, sm: 4 },
                        py: { xs: 3, sm: 5 },
                    }}
                >
                    {/* Encabezado del módulo */}
                    <Box
                        component="header"
                        sx={{
                            textAlign: "center",
                            mb: { xs: 4, md: 5 },
                            px: { xs: 1, sm: 3 },
                        }}
                    >
                        <Chip
                            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                            label={t("moduleLabel")}
                            sx={{
                                mb: 2,
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.primary.main, 0.14),
                                color: "text.secondary",
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, 0.25),
                                "& .MuiChip-icon": { color: theme.palette.primary.main },
                            }}
                        />

                        <Typography
                            variant="h3"
                            component="h1"
                            color="primary.main"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
                                lineHeight: 1.2,
                            }}
                        >
                            {t("title")}
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                maxWidth: 660,
                                mx: "auto",
                                mt: 1.5,
                                fontSize: { xs: "0.92rem", sm: "1rem" },
                            }}
                        >
                            {t("subtitle")}
                        </Typography>

                        <Box sx={{ maxWidth: 520, mx: "auto", mt: 3 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                    {t("routeProgress")}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    {progresoPorcentaje}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progresoPorcentaje}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 5,
                                        backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    },
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                                {totalNivelesCompletados} / {totalNiveles} {t("levelsCompleted")}
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: "flex-start" }}>
                        {/* Camino: mundos y niveles */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Stack spacing={{ xs: 3, md: 3.5 }}>
                                {mundos.map((mundo) => {
                                    const tituloTraducido = t(mundo.tituloSeparadorKey);
                                    const titulo = tituloTraducido !== mundo.tituloSeparadorKey
                                        ? tituloTraducido
                                        : mundo.tituloSeparador;

                                    return (
                                        <WorldCard
                                            key={mundo.id}
                                            mundo={mundo}
                                            titulo={titulo}
                                            onSelectNivel={setNivelActivoId}
                                        />
                                    );
                                })}
                            </Stack>
                        </Grid>

                        {/* Colección de insignias */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box
                                sx={{
                                    position: { md: "sticky" },
                                    top: { md: 96 },
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    boxShadow:
                                        theme.palette.mode === "dark"
                                            ? "0 10px 30px rgba(0,0,0,0.25)"
                                            : "0 10px 30px rgba(42, 71, 94, 0.08)",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: { xs: 2.25, sm: 2.75 },
                                        backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                                    }}
                                >
                                    <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2.5,
                                                flexShrink: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "primary.main",
                                                bgcolor: alpha(theme.palette.primary.main, 0.14),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.primary.main, 0.28),
                                            }}
                                        >
                                            <EmojiEventsRoundedIcon />
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                                                {t("badgeCollection")}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {insigniasDesbloqueadas} / {insigniasCamino.length}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <LinearProgress
                                        variant="determinate"
                                        value={insigniasPorcentaje}
                                        sx={{
                                            mt: 2,
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 4,
                                                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                            },
                                        }}
                                    />
                                </Box>

                                <Divider />

                                <Box
                                    sx={{
                                        p: { xs: 1.5, sm: 2 },
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.25,
                                    }}
                                >
                                    {insigniasCamino.map((insignia, index) => (
                                        <InsigniaCard
                                            key={`${insignia.name}-${index}`}
                                            img={insignia.img}
                                            mundo={insignia.mundo}
                                            name={insignia.name}
                                            bloqueado={index >= insigniasDesbloqueadas}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Footer />
        </>
    );
}
