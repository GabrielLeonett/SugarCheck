import {useState} from "react"
import {mundosData} from "./Components/dataWorld";
import {VistaLeccion} from "./Components/nivel"
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { Box, Grid, Typography } from "@mui/material";
import InsigniaCard from "./Components/InsigniasCard";
import { HexagonoMundo } from "./Components/NivelesHexagono";
import yelmo_de_sabiduria from "../../assets/insigniasCamino/yelmo_de_sabiduria.png"
import escudo_de_fibra from "../../assets/insigniasCamino/escudo_de_fribra.png";
import SeparadorMundo from "./Components/SeparaMundos"
export function Camino() {

const [mundos, setMundos] = useState(mundosData);
const [mundoActualId, setMundoActualId] = useState("mundo-1");
const [nivelActivoId, setNivelActivoId] = useState<number | null>(null);


const completarNivel = (numeroNivelActual: number) => {
    setMundos((prevMundos) =>
        prevMundos.map((mundo) => ({
            ...mundo,
            niveles: mundo.niveles.map((nivel) => {
                const numNivel = Number(nivel.numero);

                // 1. Si es el nivel que acabamos de terminar -> marcar completado (verde)
                if (numNivel === numeroNivelActual) {
                    return { ...nivel, color: true };
                }

                // 2. Si es el nivel siguiente -> desbloquear
                if (numNivel === numeroNivelActual + 1) {
                    return { ...nivel, bloqueado: false };
                }

                return nivel;
            }),
        }))
    );

    // Regresar al mapa
    setNivelActivoId(null);
};

if (nivelActivoId !== null) {
    return (
        <VistaLeccion
            nivelId={nivelActivoId}
            onCompletarExito={() => completarNivel(nivelActivoId)}
            onVolver={() => setNivelActivoId(null)}
        />
    );
  }

return (
    <>
    <Navbar />
    <Box sx={{width:"100%", border: "2px", mx: { xs: 0, sm: 6 }, mt:2, p: { xs: 1, sm: 2 }, display: "flex", flexDirection: "column", alignItems: "center" }}>  
        <Grid container  sx={{ mt: 2, width: "100%" }}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h3" sx={{ textAlign: "center" }}>
                    Camino del guerrero
                </Typography>
                <Box sx={{ border: "2px", p: 2, height: "100%" }}>
                    {mundos.map((mundo) => (
                    <Box key={mundo.id}>
                
                    <SeparadorMundo 
                        numero={mundo.numeroMundo} 
                        texto={mundo.tituloSeparador} 
                        bool={!mundo.bloqueado} 
                    />

                    {/* 2. Recorremos los niveles (hexágonos) de este mundo */}
                    {mundo.niveles.map((nivel, idx) => {
                        const tieneLineas = idx < mundo.niveles.length - 1;
                        
                        return (
                            <HexagonoMundo 
                            key={nivel.numero}
                            numero={nivel.numero} 
                            lines={tieneLineas} 
                            color={nivel.color}
                            bloqueado={nivel.bloqueado}
                            onClick={() => {
                                if (nivel.bloqueado) {
                                    console.log("Nivel bloqueado");
                                    return; 
                                }
                                setNivelActivoId(nivel.numero);
                            }}
                            />
                        );
                        })}

                <Typography>Estás en el mundo ID: {mundoActualId}</Typography>

                </Box>
            ))}
            </Box>
            </Grid>
                {/*aca es el apartado de las insignias*/} 
            <Grid  size={{ xs: 12, md: 4 }} >
                <Box  //contenedor azul principal de las insignias y sus propiedades
                sx={{
                borderRadius: 2,
                p: 0,
                mx: { xs: 0, sm: 9 },
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
                <Typography variant="h5" sx={{ color: 'white', textAlign: 'center', fontWeight: 'bold', pt: 4 }}>
                Colección de Insignias
                </Typography>
                <InsigniaCard img={escudo_de_fibra} mundo="Mundo 1" name="escudo de fibra" bloqueado={false}    />
                <InsigniaCard img={yelmo_de_sabiduria} mundo="Mundo 2" name="yelmo de la sabiduria" bloqueado />
                <InsigniaCard img={yelmo_de_sabiduria} mundo="Mundo 2" name="yelmo de la sabiduria" bloqueado />
                <InsigniaCard img={yelmo_de_sabiduria} mundo="Mundo 2" name="yelmo de la sabiduria" bloqueado />
                {/* Sección de progreso simulada al fondo del Box */}
                <Box sx={{ mt: 'auto', pt: 2, color: 'white', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{("routeProgress")}</Typography>
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
