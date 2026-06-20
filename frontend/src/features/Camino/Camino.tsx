import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { Box, Grid, Typography } from "@mui/material";
import InsigniaCard from "./Components/InsigniasCard";
export function Camino() {
return (
    <>

    <Navbar />
    <Box sx={{width:"95%", border: "2px solid black", mx:6, mt:2, p:2, display: "flex", flexDirection: "column", alignItems: "center" }}>  
        <Typography variant="h3" sx={{ textAlign: "center" }}>
            Camino del guerrero
        </Typography>
        <Grid container  sx={{ mt: 2, width: "100%" }}>
            <Grid size={8}>
                <Box sx={{ border: "2px solid black", p: 2, height: "100%" }}>
                </Box>
            </Grid>
            <Grid  size={4} >
                <Box  //contenedor azul principal de las insignias y sus propiedades
                sx={{
                /*width: 329,
                height: 1091,*/
                borderRadius: 2,
                p: 0,
                mx: 9 ,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: 'primary.main',
                '&:hover': {
                    bgcolor: 'primary.main',
                /*position: 'sticky'*/
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
                <InsigniaCard/>
                {/* Sección de progreso simulada al fondo del Box */}
                <Box sx={{ mt: 'auto', pt: 2, color: 'white', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Progreso de la Ruta</Typography>
                {/* Tu barra de progreso irá aquí */}
                </Box>
                </Box>
            </Grid>
        </Grid>
    </Box>
    <Footer />
    </>
);
}
