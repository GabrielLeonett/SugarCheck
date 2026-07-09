import { Box, Typography } from "@mui/material";

interface HexagonoMundoProps {
    numero?: number | string;
    color?: boolean; 
    size?: number;
    lines?: boolean; // true = dibuja conector punteado
}

export function HexagonoMundo({
    color = false, 
    size = 75, 
    numero = 0,
    lines = false,
}: HexagonoMundoProps) {
const num = Number(numero);
const esPar = num % 2 === 0;

return (
    // 1. CAPA EXTERNA: Controla el zigzag y la animación al pasar el mouse
    <Box
        sx={{
        display: "flex",
        justifyContent: "center", 
        alignItems: "center",
        width: "100%",            
        my: 3,
        transform: esPar ? "translateX(-60px)" : "translateX(60px)", 
        transition: "transform 0.3s ease-in-out",

        // Disparador del Hover para escalar el hexágono y mostrar la misión
        "&:hover": {
            transform: esPar ? "translateX(-60px) scale(1.1)" : "translateX(60px) scale(1.1)",
            "& .mision-container": {
                opacity: 1,
                transform: "translateY(-50%) scale(1)",
            },
        },
        }}
    >
      {/* 2. CAPA INTERNA: Caja contenedora real del hexágono */}
    <Box
        sx={{
            position: "relative",
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
        }}
    >
        {/* 🌟 LÍNEA CONECTOR PUNTEADA (SVG ABSOLUTO) */}
        {lines && (
        <svg
            style={{
                position: "absolute",
                top: size / 2, 
                left: esPar ? size / 2 : "auto",
                right: esPar ? "auto" : size / 2,
                width: "120px", 
                height: "90px", 
                overflow: "visible",
                zIndex: 0, 
                pointerEvents: "none",
            }}
        >
            <line
                x1={esPar ? "0" : "120"}
                y1="0"
                x2={esPar ? "120" : "0"}
                y2="90" 
                stroke="#000000" 
                strokeWidth="4"   
                strokeDasharray="2, 8" 
                strokeLinecap="round"  
            />
        </svg>
        )}

        {/* Dibujo del hexágono */}
        <svg
            viewBox="0 0 100 100"
            width="100%" 
            height="100%"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        >
        <polygon
            points="50,5 95,25 95,75 50,95 5,75 5,25"
            fill={color ? "#4caf50" : "#909190"}
            stroke={color ? "#388e3c" : "#3a3a3a"}
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
            fontSize: `${size * 0.35}px`,
            userSelect: "none",
            lineHeight: 1,
            zIndex: 2, 
            }}
        >
            {numero}
        </Typography>

        {/* 🌟 CONTENEDOR DE LA MISIÓN EN HOVER */}
        <Box
            className="mision-container"
            sx={{
                position: "absolute",
                top: "50%",
                right: "100%", 
                transform: "translateY(-50%) scale(0.9)",
                mr: 3, 
                width: 240, 
                padding: "12px 16px",
                borderRadius: "12px", 
                bgcolor: "#ffffff", 
                border: "2px solid #e2e8f0", 
                boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
                opacity: 0, 
                pointerEvents: "none", 
                transition: "opacity 0.25s ease-in-out, transform 0.25s ease-in-out",
                zIndex: 50,

                // Piquito de la burbuja
                "&::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "10px solid #ffffff", 
            },
            // Sombra del piquito
            "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "11px solid transparent",
                borderBottom: "11px solid transparent",
                borderLeft: "11px solid #e2e8f0", 
                zIndex: -1,
            }
            }}
        >
            <Typography variant="caption" sx={{ color: "#3182ce", fontWeight: "600", display: "block", textAlign: "center", mb: 0.5 }}>
            Misión
            </Typography>
            <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: "bold", textAlign: "center", lineHeight: 1.2 }}>
            ¡La Larga Distancia!
            </Typography>
            <Typography variant="body2" sx={{ color: "#718096", textAlign: "center", fontSize: "13px", mt: 0.5 }}>
            Carbohidratos Complejos
            </Typography>
            <Typography variant="body2" sx={{ color: "#dd6b20", fontWeight: "bold", textAlign: "center", mt: 1 }}>
            Puntos de Sabiduría: 86
            </Typography>
        </Box>

        </Box>
    </Box>
  );
}