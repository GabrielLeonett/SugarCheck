import { Box, Typography } from "@mui/material";
import escudo_de_fibra from "../../../assets/insigniasCamino/escudo_de_fribra.png";

// 1. Definimos el "contrato" de qué datos puede recibir esta tarjeta
interface InsigniaCardProps {
  img: string;     
  name: string;   
  mundo: string; 
  bloqueado: boolean 
}

// 2. Le asignamos la interfaz a los parámetros usando la desestructuración de React
function InsigniaCard({ 
  img , 
  name , 
  mundo, 
  bloqueado = false
}: InsigniaCardProps) {
  
  return (
    <Box 
    component="section"
  sx={{
    p: 2,                         
    position: "relative",        
    display: "flex",
    flexDirection: "column",  
    alignItems: "center",
    justifyContent: "center",         
    borderRadius: 3,         
    width: "100%",
    maxWidth: 260,     
    mx: "auto",     
    // CAMBIO DINÁMICO: Si está bloqueado se vuelve gris opaco; si no, fondo blanco
    bgcolor: bloqueado ? "rgba(40, 40, 40, 0.6)" : "white",
    color: bloqueado ? "#8e8e8e" : "black",
    
    // Sombras: La tarjeta activa tiene una sombra suave para que parezca que flota
    boxShadow: bloqueado ? "none" : "0px 4px 10px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",      // Hace que los cambios visuales se sientan suaves
  }}>
      {/* Contenedor de la Imagen */}
      <Box
      sx={{ 
    width: 90,                        // Tamaño fijo controlado para el escudo/yelmo
    height: 90, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    mb: 1.5,                          // Separación con el texto de abajo
    // CAMBIO DINÁMICO: Si está bloqueado, pone la imagen en blanco y negro (grayscale) y opaca
    filter: bloqueado ? "grayscale(100%) opacity(40%)" : "none"}}
    >
        <img 
          src={img} 
          alt={name}  
        style={{ width: "100%", height: "100%", objectFit: "contain"  }}/>
      </Box>

      {/* Textos de la tarjeta */}
      <Box>
        <Typography
        variant="body1" 
        sx={{ 
          fontWeight: "bold", 
          textAlign: "center",
          fontSize: "0.95rem",              // Tamaño de letra estilizado y legible
          lineHeight: 1.2
        }}>
          {name}
        </Typography>
        <Typography
        variant="caption"                   // Letra más pequeña para etiquetas secundarias
        sx={{ 
          fontWeight: "bold",
          letterSpacing: 0.5,               
          mt: 0.5,                          
          color: bloqueado ? "inherit" : "#4caf50", 
          textTransform: "uppercase"}}>
          {mundo}
        </Typography>
        
        
      </Box>

    </Box>
  );
}

export default InsigniaCard;