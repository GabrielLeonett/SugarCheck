import {useEffect, useState} from "react"
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
import { completarNivelCamino, getCaminoProgreso } from "../../apis/camino";

const insigniasCamino = [
    { img: escudo_de_fibra, mundo: "Mundo 1", name: "Escudo de fibra" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 2", name: "Yelmo de la sabiduría" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 3", name: "Yelmo de la sabiduría" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 4", name: "Yelmo de la sabiduría" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 5", name: "Yelmo de la sabiduría" },
]

export function Camino() {

const [mundos, setMundos] = useState(mundosData);
const [mundoActualId, setMundoActualId] = useState("mundo-1");
const [nivelActivoId, setNivelActivoId] = useState<number | null>(null);

useEffect(() => {
    const cargarProgreso = async () => {
        try {
            const progreso = await getCaminoProgreso();
            const ultimo = progreso.ultimoNivelCompletado || 0;
            setMundos((prevMundos) =>
                prevMundos.map((mundo) => ({
                    ...mundo,
                    niveles: mundo.niveles.map((nivel) => {
                        const numNivel = Number(nivel.numero);
                        if (numNivel <= ultimo) {
                            return { ...nivel, color: true, bloqueado: true };
                        }
                        if (numNivel === ultimo + 1) {
                            return { ...nivel, color: false, bloqueado: true };
                        }
                        return { ...nivel, color: false, bloqueado: false };
                    }),
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };
    cargarProgreso();
}, []);

const totalNivelesCompletados = mundos.reduce((acc, mundo) => {
    const completadosMundo = mundo.niveles.filter((nivel) => nivel.color).length;
    return acc + completadosMundo;
}, 0);

const insigniasDesbloqueadas = Math.floor(totalNivelesCompletados / 3);


const completarNivel = async (numeroNivelActual: number) => {
    try {
        await completarNivelCamino(numeroNivelActual);
    } catch (error) {
        console.error(error);
    }

    setMundos((prevMundos) =>
        prevMundos.map((mundo) => ({
            ...mundo,
            niveles: mundo.niveles.map((nivel) => {
                const numNivel = Number(nivel.numero);

                if (numNivel === numeroNivelActual) {
                    return { ...nivel, color: true, bloqueado: true };
                }

                if (numNivel === numeroNivelActual + 1) {
                    return { ...nivel, color: false, bloqueado: true };
                }

                return nivel;
            }),
        }))
    );

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
                            bloqueado={!nivel.bloqueado}
                            onClick={() => {
                                if (!nivel.bloqueado) {
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
                {insigniasCamino.map((insignia, index) => (
                    <InsigniaCard 
                        key={`${insignia.name}-${index}`}
                        img={insignia.img} 
                        mundo={insignia.mundo} 
                        name={insignia.name} 
                        bloqueado={index >= insigniasDesbloqueadas}    
                    />
                ))}
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
