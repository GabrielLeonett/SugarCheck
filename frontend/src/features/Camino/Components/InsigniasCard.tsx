import { Box, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import useLanguage from "../../../hooks/useLanguage";

interface InsigniaCardProps {
  img: string;
  name: string;
  mundo: string;
  bloqueado: boolean;
  acento?: string;
}

function InsigniaCard({ img, name, mundo, bloqueado = false, acento = "#95BFDF" }: InsigniaCardProps) {
  const { t } = useLanguage("camino");

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.25,
        width: "100%",
        borderRadius: 2.5,
        bgcolor: bloqueado ? "action.hover" : "background.paper",
        border: "1px solid",
        borderColor: bloqueado ? "divider" : `${acento}66`,
        boxShadow: bloqueado ? "none" : `0 6px 14px ${acento}22`,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: bloqueado ? "none" : "translateY(-2px)",
          boxShadow: bloqueado ? "none" : `0 10px 20px ${acento}33`,
        },
      }}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: bloqueado
            ? "rgba(148,163,184,0.18)"
            : `radial-gradient(circle at 30% 25%, ${acento}33, ${acento}0d)`,
          border: `2px solid ${bloqueado ? "transparent" : `${acento}55`}`,
        }}
      >
        <img
          src={img}
          alt={name}
          style={{
            width: 44,
            height: 44,
            objectFit: "contain",
            display: "block",
            filter: bloqueado ? "grayscale(100%) opacity(40%)" : "none",
          }}
        />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1.2,
            color: bloqueado ? "text.disabled" : "text.primary",
          }}
        >
          {t(name) !== name ? t(name) : name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.4,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: bloqueado ? "text.disabled" : acento,
          }}
        >
          {t(mundo) !== mundo ? t(mundo) : mundo}
        </Typography>
      </Box>

      {bloqueado && (
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "action.selected",
            color: "text.disabled",
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 15 }} />
        </Box>
      )}
    </Box>
  );
}

export default InsigniaCard;
