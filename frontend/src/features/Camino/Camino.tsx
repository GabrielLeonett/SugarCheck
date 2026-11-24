import { useEffect, useState } from "react";
import { Box, Button, Chip, Grid, LinearProgress, Typography } from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { VistaLeccion } from "./Components/nivel";
import { CaminoMapa } from "./Components/CaminoMapa";
import { PanelInsignias } from "./Components/PanelInsignias";
import { MUNDOS } from "./Components/caminoTheme";
import { completarNivelCamino, getCaminoProgreso } from "../../apis/camino";
import useLanguage from "../../hooks/useLanguage";
import "./camino.css";

const TOTAL_NIVELES = 15;

export function Camino() {
  const { t } = useLanguage("camino");

  const [ultimoCompletado, setUltimoCompletado] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [nivelActivoId, setNivelActivoId] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;

    const cargarProgreso = async () => {
      try {
        const progreso = await getCaminoProgreso();
        if (!vivo) return;
        const completado = Number(progreso.ultimoNivelCompletado) || 0;
        setUltimoCompletado(Math.min(Math.max(completado, 0), TOTAL_NIVELES));
      } catch (error) {
        console.error("No se pudo cargar el progreso del Camino:", error);
      } finally {
        if (vivo) setCargando(false);
      }
    };

    cargarProgreso();
    return () => {
      vivo = false;
    };
  }, []);

  const nivelActual = Math.min(ultimoCompletado + 1, TOTAL_NIVELES);
  const porcentaje = Math.round((ultimoCompletado / TOTAL_NIVELES) * 100);
  const insigniasDesbloqueadas = Math.floor(ultimoCompletado / 3);
  const mundoActual =
    MUNDOS.find(
      (mundo) => nivelActual >= mundo.levelRange[0] && nivelActual <= mundo.levelRange[1],
    ) ?? MUNDOS[0];

  const claveTituloActual = `level${nivelActual}Title`;
  const tituloActual =
    t(claveTituloActual) !== claveTituloActual ? t(claveTituloActual) : `${t("levelLabel")} ${nivelActual}`;

  const completarNivel = async (numeroNivel: number) => {
    try {
      await completarNivelCamino(numeroNivel);
    } catch (error) {
      console.error("No se pudo guardar el nivel del Camino:", error);
    }

    setUltimoCompletado((previo) => Math.max(previo, numeroNivel));
    setNivelActivoId(null);
  };

  const irANivelActual = () => {
    document
      .getElementById("camino-nivel-actual")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        sx={{
          width: "100%",
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        {/* Encabezado del camino */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 3, sm: 4 },
            p: { xs: 2.5, sm: 3.5, md: 4 },
            mb: { xs: 2, sm: 3 },
            color: "#ffffff",
            background:
              "linear-gradient(120deg, #2a475e 0%, #3d586c 42%, #558eb9 78%, #7aafd7 100%)",
            boxShadow: "0 18px 40px rgba(42,71,94,0.32)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              top: -90,
              right: -40,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              bottom: -70,
              right: 120,
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <Typography
            variant="h3"
            sx={{
              position: "relative",
              fontSize: { xs: 30, sm: 40, md: 48 },
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            {t("title")}
          </Typography>
          <Typography
            sx={{
              position: "relative",
              maxWidth: 640,
              fontSize: { xs: 14, sm: 16 },
              opacity: 0.92,
            }}
          >
            {t("subtitle")}
          </Typography>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 2.25,
            }}
          >
            <Chip
              icon={<BoltRoundedIcon sx={{ color: "#fff !important" }} />}
              label={`${ultimoCompletado} / ${TOTAL_NIVELES} ${t("levelsCompleted")}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            />
            <Chip
              label={`${porcentaje}%`}
              sx={{
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            />
            <Chip
              label={`${t("world")} ${mundoActual.numero} · ${t(mundoActual.tituloKey)}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.28)",
                maxWidth: "100%",
              }}
            />
            <Button
              size="small"
              variant="contained"
              startIcon={<FlagRoundedIcon />}
              onClick={irANivelActual}
              sx={{
                ml: { sm: "auto" },
                bgcolor: "#ffffff",
                color: "#2a475e",
                fontWeight: 800,
                "&:hover": { bgcolor: "#e4eff7" },
              }}
            >
              {t("goToMyLevel")}
            </Button>
          </Box>
        </Box>

        {cargando && (
          <LinearProgress
            sx={{ mb: 2, height: 6, borderRadius: 999, bgcolor: "action.selected" }}
          />
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <CaminoMapa
              ultimoCompletado={ultimoCompletado}
              onSelectLevel={setNivelActivoId}
              t={t}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <PanelInsignias
              totalCompletados={ultimoCompletado}
              insigniasDesbloqueadas={insigniasDesbloqueadas}
              nivelActual={nivelActual}
              tituloActual={tituloActual}
              t={t}
              onIrANivel={irANivelActual}
            />
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </>
  );
}
