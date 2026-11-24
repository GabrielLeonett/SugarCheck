import { Box, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { MAP_HEIGHT, MAP_WIDTH, oscurecer, type EstadoNivel } from "./caminoTheme";

interface NivelNodoProps {
  numero: number;
  x: number;
  y: number;
  estado: EstadoNivel;
  titulo: string;
  acento: string;
  acentoSuave: string;
  etiquetaNivel: string;
  etiquetaEstado: string;
  onClick: () => void;
  id?: string;
}

export function NivelNodo({
  numero,
  x,
  y,
  estado,
  titulo,
  acento,
  acentoSuave,
  etiquetaNivel,
  etiquetaEstado,
  onClick,
  id,
}: NivelNodoProps) {
  const esActual = estado === "actual";
  const bloqueado = estado === "bloqueado";

  const colores =
    estado === "completado"
      ? {
          arriba: "#d9fbe6",
          medio: "#4ade80",
          abajo: "#16a34a",
          borde: "#ecfdf5",
          lateral: "#0f5132",
        }
      : esActual
        ? {
            arriba: acentoSuave,
            medio: acento,
            abajo: oscurecer(acento, 0.2),
            borde: "#ffffff",
            lateral: oscurecer(acento, 0.42),
          }
        : {
            arriba: "#e2e8f0",
            medio: "#94a3b8",
            abajo: "#64748b",
            borde: "#94a3b8",
            lateral: "#334155",
          };

  const gradienteId = `camino-nodo-${numero}-${estado}`;
  const haloId = `camino-halo-${numero}-${estado}`;

  return (
    <Box
      id={id}
      sx={{
        position: "absolute",
        left: `${(x / MAP_WIDTH) * 100}%`,
        top: `${(y / MAP_HEIGHT) * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: esActual ? 12 : 8,
        width: { xs: 72, sm: 94, md: 108 },
        height: { xs: 72, sm: 94, md: 108 },
      }}
    >
      {esActual && (
        <Box
          className="camino-pulso"
          sx={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            border: `3px solid ${acento}`,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
      )}

      <Tooltip
        arrow
        placement={x > MAP_WIDTH / 2 ? "left" : "right"}
        title={
          <Box sx={{ py: 0.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
              {etiquetaNivel} {numero}
            </Typography>
            <Typography sx={{ fontSize: 12, lineHeight: 1.25 }}>{titulo}</Typography>
            <Typography
              sx={{
                display: "block",
                mt: 0.4,
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.85,
                color: bloqueado ? "warning.light" : esActual ? "info.light" : "success.light",
              }}
            >
              {etiquetaEstado}
            </Typography>
          </Box>
        }
      >
        <Box
          component="button"
          type="button"
          onClick={onClick}
          aria-label={`${etiquetaNivel} ${numero}: ${titulo}. ${etiquetaEstado}`}
          aria-disabled={bloqueado}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            p: 0,
            border: 0,
            bgcolor: "transparent",
            cursor: bloqueado ? "not-allowed" : "pointer",
            filter: esActual
              ? `drop-shadow(0 10px 12px rgba(0,0,0,0.28)) drop-shadow(0 0 14px ${acento}88)`
              : "drop-shadow(0 8px 10px rgba(0,0,0,0.24))",
            transition: "transform 0.18s ease, filter 0.18s ease",
            "&:hover": {
              transform: bloqueado ? "none" : "translateY(-4px) scale(1.05)",
            },
            "&:active": {
              transform: bloqueado ? "none" : "translateY(-1px) scale(0.98)",
            },
            "&:focus-visible": {
              outline: `3px solid ${acento}`,
              outlineOffset: 4,
              borderRadius: "50%",
            },
          }}
        >
          <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
            <defs>
              <linearGradient id={gradienteId} x1="0.25" y1="0" x2="0.75" y2="1">
                <stop offset="0%" stopColor={colores.arriba} />
                <stop offset="52%" stopColor={colores.medio} />
                <stop offset="100%" stopColor={colores.abajo} />
              </linearGradient>
              <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
                <stop offset="55%" stopColor={acento} stopOpacity={0.35} />
                <stop offset="100%" stopColor={acento} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Halo suave del nivel actual */}
            {esActual && <circle cx={60} cy={60} r={58} fill={`url(#${haloId})`} />}

            {/* Sombra en el suelo */}
            <ellipse cx={60} cy={107} rx={36} ry={9} fill="rgba(15,23,42,0.28)" />

            {/* Extrusión inferior (volumen 3D) */}
            <circle cx={60} cy={64} r={42} fill={colores.lateral} />

            {/* Cara principal */}
            <circle
              cx={60}
              cy={56}
              r={42}
              fill={`url(#${gradienteId})`}
              stroke={colores.borde}
              strokeWidth={4}
            />

            {/* Aro interior */}
            <circle
              cx={60}
              cy={56}
              r={33}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={2.5}
            />

            {/* Brillo glossy */}
            <ellipse
              cx={58}
              cy={38}
              rx={27}
              ry={14}
              fill="#ffffff"
              opacity={esActual ? 0.42 : 0.3}
              transform="rotate(-12 58 38)"
            />
            <circle cx={40} cy={32} r={4.5} fill="#ffffff" opacity={0.55} />

            {bloqueado && (
              <circle cx={60} cy={56} r={42} fill="rgba(15,23,42,0.22)" />
            )}
          </svg>

          <Typography
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: { xs: 27, sm: 35, md: 41 },
              lineHeight: 1,
              textShadow: "0 2px 0 rgba(0,0,0,0.18), 0 3px 6px rgba(0,0,0,0.4)",
              userSelect: "none",
            }}
          >
            {numero}
          </Typography>

          {estado === "completado" && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: { xs: 24, sm: 29, md: 32 },
                height: { xs: 24, sm: 29, md: 32 },
                borderRadius: "50%",
                bgcolor: "#16a34a",
                border: "2.5px solid #ffffff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: { xs: 15, sm: 19, md: 21 }, color: "#ffffff" }} />
            </Box>
          )}

          {bloqueado && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: { xs: 24, sm: 29, md: 32 },
                height: { xs: 24, sm: 29, md: 32 },
                borderRadius: "50%",
                bgcolor: "#1e293b",
                border: "2.5px solid #cbd5e1",
                display: "grid",
                placeItems: "center",
              }}
            >
              <LockRoundedIcon sx={{ fontSize: { xs: 13, sm: 16, md: 18 }, color: "#e2e8f0" }} />
            </Box>
          )}
        </Box>
      </Tooltip>
    </Box>
  );
}
