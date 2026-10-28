import { useState } from "react";
import { Box, Typography, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { 
    Close as CloseIcon, 
    CheckCircle as CheckCircleOutlineIcon, 
    Error as ErrorOutlineIcon, 
    Help as HelpOutlineIcon 
} from "@mui/icons-material";
import { leccionesPorNivel } from "./contenidoData";
import { videosPorNivel } from "./videosMap";

interface VistaLeccionProps {
    nivelId: number;
    onCompletarExito: () => void;
    onVolver: () => void;
}

export function VistaLeccion({ nivelId, onCompletarExito, onVolver }: VistaLeccionProps) {
    const leccionData = leccionesPorNivel[nivelId] || leccionesPorNivel[1];
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

    const preguntaActual = leccionData.preguntas[preguntaIndex];
    const totalPreguntas = leccionData.preguntas.length;
    const progresoPorcentaje = ((preguntaIndex) / totalPreguntas) * 100;

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
        <Box sx={{ minHeight: "100vh", bgcolor: "#eef4f8", display: "flex", flexDirection: "column", p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 800, mx: "auto", width: "100%", mb: 4 }}>
                <IconButton onClick={() => setModalSalidaAbierto(true)}>
                    <CloseIcon sx={{ fontSize: 28, color: "#333" }} />
                </IconButton>

                <Box sx={{ flex: 1, mx: 3, height: 16, bgcolor: "#b0c4de", borderRadius: 8, overflow: "hidden" }}>
                    <Box sx={{ width: `${progresoPorcentaje}%`, height: "100%", bgcolor: "#2196f3", transition: "width 0.4s ease" }} />
                </Box>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                    {[...Array(vidas)].map((_, idx) => (
                        <span key={idx} style={{ fontSize: 20 }}>💧</span>
                    ))}
                </Box>
            </Box>

            {viendoVideo ? (
                <Box sx={{ maxWidth: 1100, mx: "auto", width: "100%", flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: 3 }}>
                    <Typography variant="h5" sx={{ color: "#64b5f6", fontWeight: "bold" }}>
                        {leccionData.titulo}
                    </Typography>
                    {videoSrc && (
                        <Box sx={{ width: "100%", aspectRatio: "16/9", borderRadius: 2, overflow: "hidden", boxShadow: 3, bgcolor: "#000" }}>
                            <video
                                src={videoSrc}
                                controls
                                style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                                onEnded={() => {
                                    setVideoTerminado(true);
                                }}
                            />
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        disabled={!videoTerminado}
                        onClick={() => setViendoVideo(false)}
                        sx={{ alignSelf: "center", borderRadius: 2, px: 5, py: 1.5, bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" }, "&:disabled": { bgcolor: "#bdbdbd", color: "#757575" } }}
                    >
                        CONTINUAR A LAS PREGUNTAS
                    </Button>
                </Box>
            ) : (
                <>
                    <Box sx={{ maxWidth: 700, mx: "auto", width: "100%", flex: 1, textAlign: "center" }}>
                        <Typography variant="h5" sx={{ color: "#64b5f6", fontWeight: "bold", mb: 1 }}>
                            {leccionData.titulo}
                        </Typography>

                        <Typography variant="h6" sx={{ color: "#111", fontWeight: "600", mb: 4, mt: 2 }}>
                            {preguntaActual.enunciado}
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
                            {preguntaActual.opciones.map((opcion, idx) => {
                                const estaSeleccionada = seleccionadas.includes(idx);
                                return (
                                    <Box
                                        key={idx}
                                        onClick={() => handleSeleccionarOpcion(idx)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: "2px solid",
                                            borderColor: estaSeleccionada ? "#37474f" : "#cfd8dc",
                                            bgcolor: estaSeleccionada ? "#cfd8dc" : "#e0e0e0",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            transition: "all 0.2s",
                                            "&:hover": { bgcolor: "#d5d8dc" }
                                        }}
                                    >
                                        <Box sx={{ width: 20, height: 20, border: "2px solid #555", borderRadius: preguntaActual.tipo === "multiple" ? 1 : "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: estaSeleccionada ? "#37474f" : "transparent" }}>
                                            {estaSeleccionada && <Box sx={{ width: 8, height: 8, bgcolor: "white", borderRadius: preguntaActual.tipo === "multiple" ? 0.5 : "50%" }} />}
                                        </Box>
                                        <Typography sx={{ fontWeight: 500, color: "#263238", textAlign: "left" }}>
                                            {opcion}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {mostrarAyuda && (
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 2, mb: 3, position: "relative" }}>
                                <Typography variant="body2" sx={{ color: "#555" }}>
                                    💡 Pista: Lee con atención los conceptos clave de este módulo para encontrar la respuesta correcta.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ borderTop: "2px solid", borderColor: estadoRespuesta === "correcto" ? "#81c784" : estadoRespuesta === "incorrecto" ? "#e57373" : "#b0bec5", py: 3, px: 2, bgcolor: estadoRespuesta === "correcto" ? "#e8f5e9" : estadoRespuesta === "incorrecto" ? "#ffebee" : "transparent", transition: "background 0.3s" }}>
                        <Box sx={{ maxWidth: 800, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                            {estadoRespuesta === "ninguno" ? (
                                <>
                                    <IconButton onClick={() => setMostrarAyuda(!mostrarAyuda)}>
                                        <HelpOutlineIcon sx={{ fontSize: 32, color: "#455a64" }} />
                                    </IconButton>
                                    <Button variant="contained" disabled={seleccionadas.length === 0} onClick={comprobarRespuesta} sx={{ borderRadius: 2, px: 4, bgcolor: "#5c6bc0", "&:hover": { bgcolor: "#3f51b5" } }}>
                                        COMPROBAR
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {estadoRespuesta === "correcto" ? (
                                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "#2e7d32" }} />
                                        ) : (
                                            <ErrorOutlineIcon sx={{ fontSize: 48, color: "#c62828" }} />
                                        )}
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: "bold", color: estadoRespuesta === "correcto" ? "#2e7d32" : "#c62828" }}>
                                                {estadoRespuesta === "correcto" ? "¡Excelente trabajo!" : "¡Buen intento!"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#424242", maxWidth: 500 }}>
                                                {estadoRespuesta === "correcto" ? preguntaActual.retroCorrecta : preguntaActual.retroIncorrecta}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button variant="contained" onClick={siguientePaso} sx={{ borderRadius: 2, px: 5, py: 1.5, bgcolor: estadoRespuesta === "correcto" ? "#4caf50" : "#ff5252", "&:hover": { bgcolor: estadoRespuesta === "correcto" ? "#388e3c" : "#ff1744" } }}>
                                        CONTINUAR
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </>
            )}

            <Dialog open={modalSalidaAbierto} onClose={() => setModalSalidaAbierto(false)}>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>¡Espera, no te vayas!</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body1">Si sales ahora, perderás el progreso de este nivel y la oportunidad de ganar tus puntos.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
                    <Button variant="contained" onClick={() => setModalSalidaAbierto(false)} sx={{ bgcolor: "#64b5f6" }}>
                        Continuar Misión
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => { setModalSalidaAbierto(false); onVolver(); }}>
                        Salir de todas formas
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalSinVidasAbierto} onClose={() => {}}>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>¡Sin vidas!</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body1">Te quedaste sin vidas. Vuelve al mapa para intentarlo de nuevo.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button variant="contained" onClick={() => { setModalSinVidasAbierto(false); onVolver(); }} sx={{ bgcolor: "#ff5252", "&:hover": { bgcolor: "#ff1744" } }}>
                        Volver al mapa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
