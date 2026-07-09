import { Box, Typography } from "@mui/material";

interface SeparadorMundoProps {
    texto: string; 
    numero:string | number
    bool: boolean
}

function SeparadorMundo({ 
    texto = "Tierras de la Energía", 
    numero = "1", 
    bool = true
}: SeparadorMundoProps) {
return (
    <Box
    sx={{
        width: "100%",
        backgroundColor: bool ? "#2c3e50" : "rgba(114, 113, 113, 0.77)" , // El color azul oscuro/grisáceo de la barra en tu Figma
        borderRadius: 2,             // Esquinas un poco redondeadas
        py: 1.5,                    // Padding arriba y abajo para darle grosor
        px: 3,                      // Padding a los lados
        display: "flex",
        alignItems: "center",       // Centra todo verticalmente
        justifyContent: "center",   // Centra el contenido horizontalmente
        gap: 2,                     // Separación entre las líneas y el texto
        my: 3,                      // Margen externo arriba y abajo para separarlo de los hexágonos
    }}
    >
      {/* Línea Izquierda */}
    <Box 
        sx={{ 
          flexGrow: 1,              // Hace que la línea se estire todo lo posible hacia la izquierda
          height: "2px",            // Grosor de la línea
          backgroundColor: bool ? "rgba(255, 255, 255, 0.6)" : "black"   // Color blanco con un toque de transparencia
        }} 
    />

      {/* Texto Central */}
    <Typography
        variant="body1"
        sx={{
            color: bool ? "white" : "black",
            fontWeight: "bold",
            fontSize: "1.1rem",
            whiteSpace: "nowrap",     // Evita que el texto se rompa en dos renglones si la pantalla se achica
        }}
    >
        Mundo {numero} : {texto}
    </Typography>

      {/* Línea Derecha */}
    <Box 
        sx={{ 
            flexGrow: 1,              // Hace que la línea se estire todo lo posible hacia la derecha
            height: "2px", 
            backgroundColor: bool ? "rgba(255, 255, 255, 0.6)" : "black" 
        }} 
    />
    </Box>
);
}

export default SeparadorMundo;