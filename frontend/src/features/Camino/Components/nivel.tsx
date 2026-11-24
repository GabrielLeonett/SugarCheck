import { useState } from "react";
import {
    alpha,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import { leccionesPorNivelKeys } from "./contenidoData";
import { videosPorNivel } from "./videosMap";
import WorldDecor from "./WorldDecor";
import { getWorldTheme, worldAccent } from "./worldTheme";
import useLanguage from "../../../hooks/useLanguage";

interface VistaLeccionProps {
    nivelId: number;
    onCompletarExito: () => void;
    onVolver: () => void;
}

export function VistaLeccion({ nivelId, onCompletarExito, onVolver }: VistaLeccionProps) {
    const { t } = useLanguage("camino");
    const theme = useTheme();
    const leccionKeys = leccionesPorNivelKeys[nivelId] || leccionesPorNivelKeys[1];
    const [preguntaIndex, setPreguntaIndex] = useState(0);

    const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
    const [estadoRespuesta, setEstadoRespuesta] = useState<"ninguno" | "correcto" | "incorrecto">("ninguno");
    const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
    const [mostrarAyuda, setMostrarAyuda] = useState(false);
    const [vidas, setVidas] = useState(3);
    const [modalSinVidasAbierto, setModalSinVidasAbierto] = useState(false);
    const [viendoVideo, setViendoVideo] = useState(true);
    const [videoTerminado, setVideoTerminado] = useState(false);
    const videoSrc = videosPorNivel[nivelId];

    const mundoNumero = Math.ceil(nivelId / 3);
    const worldTheme = getWorldTheme(mundoNumero);
    const acento = worldAccent(worldTheme, theme.palette.mode);
    const WorldIcon = worldTheme.Icon;

    const preguntaActual = leccionKeys.preguntas[preguntaIndex];
    const totalPreguntas = leccionKeys.preguntas.length;
    const preguntasRespondidas = preguntaIndex + (estadoRespuesta === "ninguno" ? 0 : 1);
    const progresoPorcentaje = viendoVideo
        ? (videoTerminado ? 100 : 0)
        : Math.round((preguntasRespondidas / totalPreguntas) * 100);

    const handleSeleccionarOpcion = (idx: number) => {
        if (estadoRespuesta !== "ninguno") return;

        if (preguntaActual.tipo === "multiple") {
            if (seleccionadas.includes(idx)) {
                setSeleccionadas(seleccionadas.filter((i) => i !== idx));
            } else {
                setSeleccionadas([...seleccionadas, idx]);
            }
        } else {
            setSeleccionadas([idx]);
        }
    };

    const comprobarRespuesta = () => {
        if (seleccionadas.length === 0) return;

        const esCorrecta =
            seleccionadas.length === preguntaActual.correctas.length &&
            seleccionadas.every((val) => preguntaActual.correctas.includes(val));

        if (esCorrecta) {
            setEstadoRespuesta("correcto");
        } else {
            setVidas((prevVidas) => {
                const nuevasVidas = prevVidas - 1;
                if (nuevasVidas <= 0) {
                    setModalSinVidasAbierto(true);
                }
                return nuevasVidas;
            });
            setEstadoRespuesta("incorrecto");
        }
    };

    const siguientePaso = () => {
        if (preguntaIndex + 1 < totalPreguntas) {
            setPreguntaIndex(preguntaIndex + 1);
            setSeleccionadas([]);
            setEstadoRespuesta("ninguno");
            setMostrarAyuda(false);
        } else {
            onCompletarExito();
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                bgcolor: "background.default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 3 },
                overflow: "hidden",
            }}
        >
            {/* El mundo actual también se refleja en la pantalla de la lección */}
            <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <WorldDecor world={mundoNumero} accent={acento} variant="page" />
            </Box>

            {/* Barra superior de progreso */}
            <Paper
                elevation={0}
                sx={{
                    position: "relative",
                    zIndex: 3,
                    width: "100%",
                    maxWidth: 980,
                    mt: { xs: 0, sm: 2 },
                    px: { xs: 1.5, sm: 2.5 },
                    py: 1.5,
                    borderRadius: 3.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.paper, 0.92),
                    backdropFilter: "blur(10px)",
                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 8px 24px rgba(0,0,0,0.25)"
                            : "0 8px 24px rgba(42, 71, 94, 0.08)",
                }}
            >
                <Stack direction="row" sx={{ alignItems: "center", gap: { xs: 1.25, sm: 2 } }}>
                    <IconButton
                        onClick={() => setModalSalidaAbierto(true)}
                        aria-label={t("close")}
                        sx={{
                            bgcolor: "action.hover",
                            color: "text.secondary",
                            "&:hover": { bgcolor: "action.selected" },
                        }}
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                            <Chip
                                icon={<WorldIcon sx={{ fontSize: 15 }} />}
                                label={`${t("world")} ${mundoNumero} · ${t("level")} ${nivelId}`}
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    bgcolor: alpha(acento, 0.12),
                                    color: "text.primary",
                                    border: "1px solid",
                                    borderColor: alpha(acento, 0.25),
                                    "& .MuiChip-icon": { color: acento },
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ color: "text.secondary", fontWeight: 600, display: { xs: "none", sm: "block" } }}
                            >
                                {viendoVideo ? (videoTerminado ? "100%" : "0%") : `${preguntasRespondidas} / ${totalPreguntas}`}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progresoPorcentaje}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(acento, 0.16),
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 4,
                                    backgroundImage: `linear-gradient(90deg, ${acento}, ${alpha(acento, 0.7)})`,
                                },
                            }}
                        />
                    </Box>

                    <Stack direction="row" aria-label={t("lives")} sx={{ alignItems: "center", gap: 0.25 }}>
                        {[0, 1, 2].map((idx) => (
                            <WaterDropRoundedIcon
                                key={idx}
                                sx={{
                                    fontSize: { xs: 20, sm: 24 },
                                    color: idx < vidas ? theme.palette.error.main : alpha(theme.palette.text.disabled, 0.3),
                                    transition: "color 0.25s ease",
                                }}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Paper>

            {viendoVideo ? (
                <Paper
                    elevation={0}
                    sx={{
                        position: "relative",
                        zIndex: 2,
                        width: "100%",
                        maxWidth: 980,
                        mt: 3,
                        p: { xs: 2, sm: 3.5 },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        boxShadow:
                            theme.palette.mode === "dark"
                                ? "0 12px 32px rgba(0,0,0,0.25)"
                                : "0 12px 32px rgba(42, 71, 94, 0.08)",
                    }}
                >
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: 2.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: acento,
                                bgcolor: alpha(acento, 0.12),
                            }}
                        >
                            <PlayArrowRoundedIcon />
                        </Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{ fontWeight: 700, fontSize: { xs: "1.05rem", sm: "1.35rem" }, lineHeight: 1.3 }}
                        >
                            {t(leccionKeys.tituloKey)}
                        </Typography>
                    </Stack>

                    {videoSrc && (
                        <Box
                            sx={{
                                width: "100%",
                                aspectRatio: "16/9",
                                borderRadius: 3,
                                overflow: "hidden",
                                bgcolor: "#000",
                                boxShadow: 2,
                            }}
                        >
                            <video
                                src={videoSrc}
                                controls
                                style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                                onEnded={() => setVideoTerminado(true)}
                                onError={() => setVideoTerminado(true)}
                            />
                        </Box>
                    )}

                    <Stack spacing={1} sx={{ alignItems: "center", mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            disabled={Boolean(videoSrc) && !videoTerminado}
                            onClick={() => setViendoVideo(false)}
                            endIcon={<PlayArrowRoundedIcon />}
                            sx={{ borderRadius: 3, px: 4, minWidth: 240 }}
                        >
                            {t("continueToQuestions")}
                        </Button>
                        {Boolean(videoSrc) && !videoTerminado && (
                            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center" }}>
                                {t("videoHint")}
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            ) : (
                <>
                    <Paper
                        elevation={0}
                        sx={{
                            position: "relative",
                            zIndex: 2,
                            width: "100%",
                            maxWidth: 860,
                            mt: 3,
                            p: { xs: 2, sm: 3.5 },
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            boxShadow:
                                theme.palette.mode === "dark"
                                    ? "0 12px 32px rgba(0,0,0,0.25)"
                                    : "0 12px 32px rgba(42, 71, 94, 0.08)",
                        }}
                    >
                        <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
                            <Chip
                                label={`${preguntaIndex + 1} / ${totalPreguntas}`}
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: alpha(acento, 0.12),
                                    color: acento,
                                }}
                            />
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                {t(leccionKeys.tituloKey)}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                color: "text.primary",
                                fontWeight: 700,
                                fontSize: { xs: "1.05rem", sm: "1.3rem" },
                                lineHeight: 1.4,
                                mb: 1,
                            }}
                        >
                            {t(preguntaActual.enunciadoKey)}
                        </Typography>

                        <Divider sx={{ my: 2.5 }} />

                        <Box sx={{ display: "grid", gap: 1.5 }}>
                            {preguntaActual.opcionesKeys.map((opcionKey, idx) => {
                                const estaSeleccionada = seleccionadas.includes(idx);
                                const letra = String.fromCharCode(65 + idx);
                                const puedeResponder = estadoRespuesta === "ninguno";

                                return (
                                    <Box
                                        key={idx}
                                        component="button"
                                        type="button"
                                        disabled={!puedeResponder}
                                        onClick={() => handleSeleccionarOpcion(idx)}
                                        sx={{
                                            all: "unset",
                                            boxSizing: "border-box",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            width: "100%",
                                            p: { xs: 1.5, sm: 1.75 },
                                            borderRadius: 2.5,
                                            border: "1.5px solid",
                                            borderColor: estaSeleccionada ? acento : "divider",
                                            bgcolor: estaSeleccionada
                                                ? alpha(acento, theme.palette.mode === "dark" ? 0.18 : 0.1)
                                                : "background.default",
                                            cursor: puedeResponder ? "pointer" : "default",
                                            transition: "all 0.18s ease",
                                            "&:hover": puedeResponder
                                                ? {
                                                    borderColor: alpha(acento, 0.55),
                                                    bgcolor: alpha(acento, theme.palette.mode === "dark" ? 0.12 : 0.05),
                                                    transform: "translateY(-1px)",
                                                }
                                                : {},
                                            "&:focus-visible": {
                                                outline: `2px solid ${acento}`,
                                                outlineOffset: 2,
                                            },
                                            "&:disabled": { opacity: 1 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                flexShrink: 0,
                                                borderRadius: preguntaActual.tipo === "multiple" ? 1.5 : "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "1.5px solid",
                                                borderColor: estaSeleccionada ? acento : alpha(theme.palette.text.secondary, 0.4),
                                                bgcolor: estaSeleccionada ? acento : "transparent",
                                                color: estaSeleccionada ? theme.palette.getContrastText(acento) : "text.secondary",
                                                fontWeight: 700,
                                                fontSize: "0.78rem",
                                                transition: "all 0.18s ease",
                                            }}
                                        >
                                            {estaSeleccionada ? <CheckRoundedIcon sx={{ fontSize: 17 }} /> : letra}
                                        </Box>
                                        <Typography
                                            sx={{
                                                textAlign: "left",
                                                color: "text.primary",
                                                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                                                fontWeight: 500,
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {t(opcionKey)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Tooltip title={t("hintLabel")} arrow>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<HelpOutlineRoundedIcon />}
                                    onClick={() => setMostrarAyuda(!mostrarAyuda)}
                                    sx={{ color: "text.secondary" }}
                                >
                                    {t("hintLabel")}
                                </Button>
                            </Tooltip>
                        </Box>

                        {mostrarAyuda && (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1.25,
                                    p: 1.75,
                                    mt: 1,
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                    border: "1px solid",
                                    borderColor: alpha(theme.palette.warning.main, 0.22),
                                }}
                            >
                                <LightbulbRoundedIcon sx={{ color: theme.palette.warning.main, fontSize: 22, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {t("hint")}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Barra de acciones */}
                    <Paper
                        elevation={0}
                        sx={{
                            position: "relative",
                            zIndex: 2,
                            width: "100%",
                            maxWidth: 860,
                            mt: 2,
                            mb: { xs: 2, sm: 0 },
                            p: { xs: 1.75, sm: 2 },
                            borderRadius: 3.5,
                            border: "1px solid",
                            borderColor:
                                estadoRespuesta === "correcto"
                                    ? alpha(theme.palette.success.main, 0.35)
                                    : estadoRespuesta === "incorrecto"
                                        ? alpha(theme.palette.error.main, 0.35)
                                        : "divider",
                            bgcolor:
                                estadoRespuesta === "correcto"
                                    ? alpha(theme.palette.success.main, 0.07)
                                    : estadoRespuesta === "incorrecto"
                                        ? alpha(theme.palette.error.main, 0.06)
                                        : alpha(theme.palette.background.paper, 0.92),
                            backdropFilter: "blur(10px)",
                            transition: "background-color 0.25s ease, border-color 0.25s ease",
                        }}
                    >
                        {estadoRespuesta === "ninguno" ? (
                            <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center", gap: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", mr: "auto", display: { xs: "none", sm: "block" } }}>
                                    {preguntaActual.tipo === "multiple" ? t("multipleHint") : ""}
                                </Typography>
                                <Button
                                    variant="contained"
                                    disabled={seleccionadas.length === 0}
                                    onClick={comprobarRespuesta}
                                    sx={{ borderRadius: 3, px: 4, minWidth: 160 }}
                                >
                                    {t("check")}
                                </Button>
                            </Stack>
                        ) : (
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                sx={{ alignItems: { xs: "stretch", sm: "center" }, gap: 1.5 }}
                            >
                                <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                                    {estadoRespuesta === "correcto" ? (
                                        <CheckCircleRoundedIcon sx={{ fontSize: 38, color: theme.palette.success.main, flexShrink: 0 }} />
                                    ) : (
                                        <ErrorRoundedIcon sx={{ fontSize: 38, color: theme.palette.error.main, flexShrink: 0 }} />
                                    )}
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 700,
                                                color: estadoRespuesta === "correcto" ? "success.main" : "error.main",
                                            }}
                                        >
                                            {estadoRespuesta === "correcto" ? t("excellentWork") : t("goodTry")}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {estadoRespuesta === "correcto"
                                                ? t(preguntaActual.retroCorrectaKey)
                                                : t(preguntaActual.retroIncorrectaKey)}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Button
                                    variant="contained"
                                    onClick={siguientePaso}
                                    sx={{
                                        borderRadius: 3,
                                        px: 4,
                                        minWidth: 160,
                                        flexShrink: 0,
                                        bgcolor: estadoRespuesta === "correcto" ? "success.main" : "error.main",
                                        "&:hover": {
                                            bgcolor: estadoRespuesta === "correcto" ? "success.dark" : "error.dark",
                                        },
                                    }}
                                >
                                    {t("continue")}
                                </Button>
                            </Stack>
                        )}
                    </Paper>
                </>
            )}

            <Dialog open={modalSalidaAbierto} onClose={() => setModalSalidaAbierto(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>{t("exitModalTitle")}</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">{t("exitModalText")}</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 1.5 }}>
                    <Button variant="contained" onClick={() => setModalSalidaAbierto(false)}>
                        {t("continueMission")}
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => { setModalSalidaAbierto(false); onVolver(); }}>
                        {t("exitAnyway")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalSinVidasAbierto} onClose={() => {}} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>{t("noLivesTitle")}</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">{t("noLivesText")}</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => { setModalSinVidasAbierto(false); onVolver(); }}
                    >
                        {t("backToMap")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
