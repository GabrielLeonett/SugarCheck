import { Box, Button, Typography } from "@mui/material";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import glucoSaludo from "../../../assets/gluco-saludo.png";
import escudoDeFibra from "../../../assets/insigniasCamino/escudo_de_fribra.png";
import yelmoDeSabiduria from "../../../assets/insigniasCamino/yelmo_de_sabiduria.png";
import imagen8 from "../../../assets/insigniasCamino/image 8.svg";
import imagen9 from "../../../assets/insigniasCamino/image 9.svg";
import lanzas from "../../../assets/insigniasCamino/lanzas.png";
import InsigniaCard from "./InsigniasCard";
import { MUNDOS } from "./caminoTheme";

const INSIGNIAS = [
  { img: escudoDeFibra, name: "Escudo de fibra", mundo: 1 },
  { img: yelmoDeSabiduria, name: "Yelmo de la sabiduría", mundo: 2 },
  { img: imagen8, name: "Peto de Precisión", mundo: 3 },
  { img: imagen9, name: "Gradas de equilibrio", mundo: 4 },
  { img: lanzas, name: "lanceta del elegido", mundo: 5 },
];

interface PanelInsigniasProps {
  totalCompletados: number;
  insigniasDesbloqueadas: number;
  nivelActual: number;
  tituloActual: string;
  t: (clave: string) => string;
  onIrANivel: () => void;
}

export function PanelInsignias({
  totalCompletados,
  insigniasDesbloqueadas,
  nivelActual,
  tituloActual,
  t,
  onIrANivel,
}: PanelInsigniasProps) {
  const porcentaje = Math.round((totalCompletados / 15) * 100);
  const mundoActual = MUNDOS.find((mundo) => nivelActual >= mundo.levelRange[0] && nivelActual <= mundo.levelRange[1]) ?? MUNDOS[0];

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 96 },
        alignSelf: "start",
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
        backgroundImage:
          "linear-gradient(180deg, rgba(149,191,223,0.16), rgba(149,191,223,0) 38%)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "#ffffff",
            background: `linear-gradient(135deg, ${mundoActual.accent}, ${mundoActual.accentSoft})`,
            boxShadow: `0 6px 14px ${mundoActual.glow}`,
          }}
        >
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.15 }}>
            {t("badgeCollection")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {insigniasDesbloqueadas} / 5 {t("badgesUnlocked")}
          </Typography>
        </Box>
      </Box>

      {/* Progreso */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: "text.secondary" }}>
            {t("routeProgress")}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: mundoActual.accent }}>
            {porcentaje}%
          </Typography>
        </Box>

        <Box sx={{ position: "relative", mt: 1, mb: 0.75 }}>
          <Box
            sx={{
              height: 12,
              borderRadius: 999,
              bgcolor: "action.selected",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${porcentaje}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #3b82f6, #14b8a6, #8b5cf6, #0ea5e9)",
                transition: "width 0.6s ease",
              }}
            />
          </Box>
          {MUNDOS.map((mundo) => {
            const meta = mundo.levelRange[1];
            const alcanzado = totalCompletados >= meta;
            const posicion = (meta / 15) * 100;
            return (
              <Box
                key={mundo.id}
                title={`${t("world")} ${mundo.numero}`}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: `${posicion}%`,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: alcanzado ? mundo.accent : "background.paper",
                  border: `2px solid ${alcanzado ? "#ffffff" : mundo.accent}`,
                  boxShadow: alcanzado ? `0 0 0 3px ${mundo.glow}` : "none",
                }}
              />
            );
          })}
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {totalCompletados} / 15 {t("levelsCompleted")}
        </Typography>
      </Box>

      {/* Misión actual con Gluco */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          background: `linear-gradient(135deg, ${mundoActual.accent}18, ${mundoActual.accentSoft}12)`,
          border: `1px solid ${mundoActual.accent}44`,
        }}
      >
        <Box
          component="img"
          src={glucoSaludo}
          alt="Gluco"
          sx={{ width: 48, height: "auto", flex: "0 0 auto" }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: mundoActual.accent,
            }}
          >
            {t("currentMission")}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }} noWrap>
            {tituloActual}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("keepGoing")}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        size="small"
        variant="contained"
        startIcon={<FlagRoundedIcon />}
        onClick={onIrANivel}
        sx={{
          mt: 1.25,
          bgcolor: mundoActual.accent,
          color: "#ffffff",
          fontWeight: 700,
          "&:hover": { bgcolor: mundoActual.accent, filter: "brightness(0.94)" },
        }}
      >
        {t("goToMyLevel")}
      </Button>

      {/* Colección */}
      <Box sx={{ mt: 2.25, display: "flex", flexDirection: "column", gap: 1 }}>
        {INSIGNIAS.map((insignia, index) => {
          const mundo = MUNDOS.find((item) => item.numero === insignia.mundo) ?? MUNDOS[0];
          return (
            <InsigniaCard
              key={`${insignia.name}-${index}`}
              img={insignia.img}
              mundo={`Mundo ${insignia.mundo}`}
              name={insignia.name}
              bloqueado={index >= insigniasDesbloqueadas}
              acento={mundo.accent}
            />
          );
        })}
      </Box>
    </Box>
  );
}
