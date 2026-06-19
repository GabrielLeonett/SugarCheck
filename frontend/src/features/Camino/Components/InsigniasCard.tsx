import { Box, Typography } from "@mui/material";

// Definimos qué datos va a recibir nuestra tarjeta
interface InsigniaCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  isLocked?: boolean; // Por si más adelante quieres manejar el estado bloqueado
}

export function InsigniaCard({ imageSrc, title, subtitle, isLocked = false }: InsigniaCardProps) {
return (
    <Box
    sx={{
        width: 245,
        height: 190,
        bgcolor: isLocked ? "#4a4a4a" : "white", // Cambia a gris si está bloqueado
        borderRadius: 2, // Da las esquinas redondeadas suaves de tu diseño
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)", // Sombra idéntica a la imagen
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        boxSizing: "border-box",
        mx: "auto", // Centra la tarjeta dentro del contenedor azul
        filter: isLocked ? "grayscale(100%)" : "none", // Efecto gris si está bloqueado
    }}
    >
      {/* 1. Imagen de la insignia */}
    <Box
        component="img"
        src={imageSrc}
        alt={title}
        sx={{
        width: 70,
        height: 70,
        objectFit: "contain",
          mb: 1.5, // Margen abajo para separar del texto
        }}
    />

      {/* 2. Título (Ej: Escudo de Fibra) */}
    <Typography
        variant="body1"
        sx={{
        fontWeight: 700,
        color: isLocked ? "#a0a0a0" : "#1a2332",
        textAlign: "center",
        fontSize: "15px",
        mb: 0.5,
        }}
    >
        {title}
    </Typography>

      {/* 3. Subtítulo (Ej: MUNDO 1 COMPLETADO) */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isLocked ? "#888888" : "#4caf50", // Verde éxito si está desbloqueada
          textAlign: "center",
          fontSize: "12px",
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}