import { useState, useEffect } from 'react';
import Gluco1 from '../../assets/images/1.png';
import Gluco2 from '../../assets/images/2.png';
import Gluco3 from '../../assets/images/3.png';
import Gluco4 from '../../assets/images/4.png';
import Gluco5 from '../../assets/images/5.png';
import Gluco6 from '../../assets/images/6.png';
import Gluco7 from '../../assets/images/7.png';
import Gluco8 from '../../assets/images/8.png';
import Gluco9 from '../../assets/images/9.png';
import Gluco10 from '../../assets/images/10.png';
import Gluco11 from '../../assets/images/11.png';
import Gluco12 from '../../assets/images/12.png';
import { Box } from '@mui/material';

// 1. Agrupamos los frames en un arreglo constante FUERA del componente.
// Esto evita que el arreglo se recree en cada renderizado.
const frames = [
    Gluco1, Gluco2, Gluco3, Gluco4, Gluco5, Gluco6,
    Gluco7, Gluco8, Gluco9, Gluco10, Gluco11, Gluco12, 
];

export default function AnimationCharge() {
    // 2. Estado para llevar el control del índice actual
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        // 3. Configuramos el intervalo. 
        // 83ms equivale aproximadamente a 12 frames por segundo (1000ms / 12)
        const fps = 22;
        const intervalTime = 5000 / fps;

        const intervalId = setInterval(() => {
            setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
        }, intervalTime);

        // 4. Muy importante: limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Box component='div' sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh'
        }}>
            <Box
                component={'img'}
                src={frames[currentFrame]}
                alt="Cargando..."
                sx={{
                    width: '150px',
                    height: 'auto'
                }}
            />
        </Box >
    );
}