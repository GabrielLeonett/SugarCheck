import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { Box, Typography } from "@mui/material";
//import { InsigniaCard } from "./Components/InsigniasCard";
export function Camino() {
return (
    <>
    <Navbar />
        <Typography variant="h3" sx={{ textAlign: "center" }}>
            Camino del guerrero
        </Typography>
        <Box  //contenedor azul principal de las insignias y sus propiedades
        sx={{
        width: 329,
        height: 1091,
        borderRadius: 2,
        p: 1,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'primary.main',
        '&:hover': {
            bgcolor: 'primary.main',
        position: 'sticky',
        top: 20,
        zIndex: 10
        },
        }}
        
        >
            {/*aca es el apartado de las insignias*/} 
            {/* 2. ¡AQUÍ ADENTRO VA TU CONTENIDO! */}
        <Typography variant="h5" sx={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        Colección de Insignias
        </Typography>

        {/* Aquí es donde más adelante inyectaremos las tarjetitas individuales */}
        <InsigniaCard 
        imageSrc={escudoImg}
        title="Escudo de Fibra"
        subtitle="MUNDO 1 COMPLETADO"
        />

        {/* Sección de progreso simulada al fondo del Box */}
        <Box sx={{ mt: 'auto', pt: 2, color: 'white', textAlign: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Progreso de la Ruta</Typography>
          {/* Tu barra de progreso irá aquí */}
        </Box>
        </Box>

    <Footer />
    </>
);
}
