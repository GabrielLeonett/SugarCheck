import { Box, Typography, useTheme } from "@mui/material";
import { AmbienteMundo } from "./AmbienteMundo";
import { GlucoGuia } from "./GlucoGuia";
import { NivelNodo } from "./NivelNodo";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  MUNDOS,
  NIVELES,
  construirSendero,
  estadoDeNivel,
} from "./caminoTheme";

interface CaminoMapaProps {
  ultimoCompletado: number;
  onSelectLevel: (numero: number) => void;
  t: (clave: string) => string;
}

export function CaminoMapa({ ultimoCompletado, onSelectLevel, t }: CaminoMapaProps) {
  const theme = useTheme();
  const oscuro = theme.palette.mode === "dark";

  const nivelActual = Math.min(ultimoCompletado + 1, NIVELES.length);
  const puntosCompletos = NIVELES.map((nivel) => ({ x: nivel.x, y: nivel.y }));
  const puntosProgreso = NIVELES.filter((nivel) => nivel.numero <= nivelActual).map((nivel) => ({
    x: nivel.x,
    y: nivel.y,
  }));

  const senderoCompleto = construirSendero(puntosCompletos);
  const senderoProgreso = construirSendero(puntosProgreso);
  const nodoActual = NIVELES.find((nivel) => nivel.numero === nivelActual);
  const mundoActual = MUNDOS.find((mundo) => mundo.numero === nodoActual?.mundo) ?? MUNDOS[0];

  const tituloNivel = (numero: number) => {
    const clave = `level${numero}Title`;
    const traducido = t(clave);
    return traducido !== clave ? traducido : `${t("levelLabel")} ${numero}`;
  };

  const etiquetaEstado = (numero: number) => {
    const estado = estadoDeNivel(numero, ultimoCompletado);
    if (estado === "completado") return t("stateCompleted");
    if (estado === "actual") return t("stateCurrent");
    return t("stateLocked");
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 720,
        mx: "auto",
        aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
      }}
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        role="img"
        aria-label={t("title")}
      >
        <defs>
          <linearGradient
            id="camino-progreso"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={0}
            y2={MAP_HEIGHT}
          >
            {MUNDOS.map((mundo, index) => (
              <stop
                key={mundo.id}
                offset={`${(index / (MUNDOS.length - 1)) * 100}%`}
                stopColor={mundo.accent}
              />
            ))}
          </linearGradient>
          <filter id="camino-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <rect
          x={0}
          y={0}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          fill={oscuro ? "#0b1118" : "#eef4fb"}
        />

        {MUNDOS.map((mundo) => (
          <AmbienteMundo key={mundo.id} mundo={mundo} oscuro={oscuro} />
        ))}

        {/* Sendero base */}
        <path
          d={senderoCompleto}
          fill="none"
          stroke="rgba(15,23,42,0.20)"
          strokeWidth={42}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={senderoCompleto}
          fill="none"
          stroke={oscuro ? "#3b4a5c" : "#e8ddc2"}
          strokeWidth={32}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={senderoCompleto}
          fill="none"
          stroke={oscuro ? "#cbd5e1" : "#ffffff"}
          strokeWidth={8}
          strokeDasharray="1 22"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />

        {/* Progreso luminoso hasta el nivel desbloqueado */}
        {puntosProgreso.length > 1 && (
          <>
            <path
              d={senderoProgreso}
              fill="none"
              stroke="url(#camino-progreso)"
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.35}
              filter="url(#camino-glow)"
            />
            <path
              key={`camino-trazo-${nivelActual}`}
              className="camino-trazo"
              d={senderoProgreso}
              fill="none"
              stroke="url(#camino-progreso)"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
            />
          </>
        )}
      </svg>

      {/* Carteles de mundo */}
      {MUNDOS.map((mundo) => {
        const primerNivel = NIVELES.find((nivel) => nivel.mundo === mundo.numero);
        const pillIzquierda = (primerNivel?.x ?? 0) > MAP_WIDTH / 2;

        return (
          <Box
            key={`titulo-${mundo.id}`}
            sx={{
              position: "absolute",
              ...(pillIzquierda ? { left: { xs: 8, sm: 16 } } : { right: { xs: 8, sm: 16 } }),
              top: `${((mundo.band.y + 10) / MAP_HEIGHT) * 100}%`,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: { xs: 1.25, sm: 1.75 },
              py: { xs: 0.5, sm: 0.75 },
              maxWidth: { xs: "46%", sm: "52%" },
              borderRadius: 999,
              color: "#ffffff",
              background: `linear-gradient(135deg, ${mundo.accent}, ${mundo.accentSoft})`,
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: `0 8px 18px ${mundo.glow}`,
              pointerEvents: "none",
            }}
          >
          <Typography component="span" sx={{ fontSize: { xs: 13, sm: 15 }, lineHeight: 1 }}>
            {mundo.emoji}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 10.5, sm: 12.5 },
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("world")} {mundo.numero}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 10, sm: 12 },
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              opacity: 0.95,
              display: { xs: "none", sm: "block" },
            }}
          >
            · {t(mundo.tituloKey)}
          </Typography>
        </Box>
        );
      })}

      {NIVELES.map((nivel) => {
        const mundo = MUNDOS.find((item) => item.numero === nivel.mundo) ?? MUNDOS[0];
        const estado = estadoDeNivel(nivel.numero, ultimoCompletado);
        return (
          <NivelNodo
            key={nivel.numero}
            id={estado === "actual" ? "camino-nivel-actual" : undefined}
            numero={nivel.numero}
            x={nivel.x}
            y={nivel.y}
            estado={estado}
            titulo={tituloNivel(nivel.numero)}
            acento={mundo.accent}
            acentoSuave={mundo.accentSoft}
            etiquetaNivel={t("levelLabel")}
            etiquetaEstado={etiquetaEstado(nivel.numero)}
            onClick={() => {
              if (nivel.numero > ultimoCompletado + 1) return;
              onSelectLevel(nivel.numero);
            }}
          />
        );
      })}

      {nodoActual && ultimoCompletado < NIVELES.length && (
        <GlucoGuia
          x={nodoActual.x}
          y={nodoActual.y}
          titulo={tituloNivel(nodoActual.numero)}
          etiqueta={t("currentMission")}
          mensaje={t("keepGoing")}
          acento={mundoActual.accent}
        />
      )}
    </Box>
  );
}
