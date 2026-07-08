import { Box, Typography } from "@mui/material";

interface HexagonoMundo {
numero?: number | string;
color?: string;
size?: number;
}

// Configuro los valores por defecto en los parámetros usando 'props'
export function HexagonoMundo({
    color = "#4caf50", 
    size = 60,        
    numero = 0         
}: HexagonoMundo) {
return (
    <Box
    sx={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
        transform: "scale(1.1)",
        },
    }}
    >
      {/* Dibujo del hexágono */}
    <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
    >
        <polygon
            points="50,5 95,25 95,75 50,95 5,75 5,25"
            fill={color}
            stroke="#388e3c"
            strokeWidth="4"
            strokeLinejoin="round"
        />
    </svg>

      {/* Número centralizado */}
    <Typography
        variant="body1"
        sx={{
            position: "relative",
            color: "white",
            fontWeight: "bold",
            fontSize: `${size * 0.4}px`,
            userSelect: "none",
            lineHeight: 1,
        }}
    >
        {numero}
    </Typography>
    </Box>
);
}