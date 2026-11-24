import { Box, Typography } from "@mui/material";
import glucoSaludo from "../../../assets/gluco-saludo.png";
import { MAP_HEIGHT, MAP_WIDTH } from "./caminoTheme";

interface GlucoGuiaProps {
  x: number;
  y: number;
  titulo: string;
  etiqueta: string;
  mensaje: string;
  acento: string;
}

/** Gluco flota sobre el nivel desbloqueado y señala la misión actual. */
export function GlucoGuia({ x, y, titulo, etiqueta, mensaje, acento }: GlucoGuiaProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${(x / MAP_WIDTH) * 100}%`,
        top: `${(y / MAP_HEIGHT) * 100}%`,
        transform: {
          xs: "translate(-50%, calc(-100% - 44px))",
          sm: "translate(-50%, calc(-100% - 55px))",
          md: "translate(-50%, calc(-100% - 62px))",
        },
        zIndex: 25,
        width: { xs: 54, sm: 188, md: 216 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          position: "relative",
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 2.5,
          px: 1.25,
          py: 0.75,
          mb: 0.5,
          textAlign: "center",
          border: `2px solid ${acento}`,
          boxShadow: "0 10px 24px rgba(15,23,42,0.22)",
          "&::after": {
            content: '""',
            position: "absolute",
            left: "50%",
            bottom: -8,
            transform: "translateX(-50%) rotate(45deg)",
            width: 14,
            height: 14,
            bgcolor: "background.paper",
            borderRight: `2px solid ${acento}`,
            borderBottom: `2px solid ${acento}`,
            borderRadius: 0.5,
          },
        }}
      >
        <Typography
          sx={{
            display: "block",
            color: acento,
            fontWeight: 800,
            fontSize: { xs: 9.5, sm: 10.5, md: 11.5 },
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {etiqueta}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: 11, sm: 12.5, md: 13.5 },
            lineHeight: 1.2,
          }}
        >
          {titulo}
        </Typography>
        <Typography
          sx={{
            display: { xs: "none", sm: "block" },
            mt: 0.25,
            fontSize: 10.5,
            lineHeight: 1.2,
            color: "text.secondary",
          }}
        >
          {mensaje}
        </Typography>
      </Box>

      <Box
        component="img"
        src={glucoSaludo}
        alt="Gluco, tu guía en el Camino"
        className="camino-gluco"
        sx={{
          width: { xs: 54, sm: 70, md: 82 },
          height: "auto",
          filter: `drop-shadow(0 8px 10px ${acento}66)`,
        }}
      />
    </Box>
  );
}
