import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { PhysicalRecord } from '../../../types/types';
import useLanguage from "../../../hooks/useLanguage";

interface HistoryChartProps {
  records: PhysicalRecord[];
}

type FilterType = 'TODOS' | 'TRIMESTRE' | 'AÑO';

export const HistoryChart: React.FC<HistoryChartProps> = ({ records }) => {
  const { t } = useLanguage("monitoreoFisico");
  const [activeFilter, setActiveFilter] = useState<FilterType>('TODOS');

  // Para el gráfico, normalmente queremos ver los datos del más antiguo al más reciente (de izquierda a derecha).
  // Como tu bitácora inserta al inicio (el más reciente primero), invertimos una copia del array.
  const chartData = [...records].reverse();
  
  // Extraemos las etiquetas (eje X) y los datos de peso (eje Y)
  const xLabels = chartData.map(record => record.fecha);
  const weightData = chartData.map(record => record.peso);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Cabecera del gráfico: Título y Filtros */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 3 
        }}
      >
        <Typography 
          sx={{ 
            color: '#34495E', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            maxWidth: '200px',
            lineHeight: 1.2
          }}
        >
          {t("chartTitle")}
        </Typography>

        <ButtonGroup 
          variant="outlined" 
          size="small" 
          sx={{ 
            '& .MuiButton-root': {
              borderColor: '#7FB3D5',
              color: '#7FB3D5',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }
          }}
        >
          <Button 
            onClick={() => setActiveFilter('TODOS')}
            sx={{ 
              backgroundColor: activeFilter === 'TODOS' ? '#7FB3D5' : 'transparent',
              color: activeFilter === 'TODOS' ? '#FFFFFF !important' : '#7FB3D5',
              '&:hover': { backgroundColor: activeFilter === 'TODOS' ? '#5C97BF' : '#EBF2F7' }
            }}
          >
            {t("filterAll")}
          </Button>
          <Button 
            onClick={() => setActiveFilter('TRIMESTRE')}
            sx={{ 
              backgroundColor: activeFilter === 'TRIMESTRE' ? '#7FB3D5' : 'transparent',
              color: activeFilter === 'TRIMESTRE' ? '#FFFFFF !important' : '#7FB3D5',
              '&:hover': { backgroundColor: activeFilter === 'TRIMESTRE' ? '#5C97BF' : '#EBF2F7' }
            }}
          >
            {t("filterQuarter")}
          </Button>
          <Button 
            onClick={() => setActiveFilter('AÑO')}
            sx={{ 
              backgroundColor: activeFilter === 'AÑO' ? '#7FB3D5' : 'transparent',
              color: activeFilter === 'AÑO' ? '#FFFFFF !important' : '#7FB3D5',
              '&:hover': { backgroundColor: activeFilter === 'AÑO' ? '#5C97BF' : '#EBF2F7' }
            }}
          >
            {t("filterYear")}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Contenedor del Gráfico */}
      <Box 
        sx={{ 
          width: '100%', 
          height: 300, 
          backgroundColor: '#FFFFFF', // Fondo blanco de la gráfica en tu imagen
          border: '1px solid #CCD5DE',
          borderRadius: '4px',
          pt: 2,
          pr: 2
        }}
      >
        <LineChart
          xAxis={[
            { 
              scaleType: 'point', 
              data: xLabels,
              tickLabelStyle: { fill: '#7F8C8D', fontSize: 12 }
            }
          ]}
          yAxis={[
            {
              min: Math.min(...weightData) - 5, // Darle un poco de margen inferior al gráfico
              max: Math.max(...weightData) + 5, // Darle margen superior
              tickLabelStyle: { fill: '#7F8C8D', fontSize: 12 }
            }
          ]}
          series={[
            {
              data: weightData,
              color: '#7FB3D5', // Azul claro de la línea
              showMark: true,   // Muestra los puntos en las intersecciones
              curve: 'linear',  // Línea recta entre puntos como en tu imagen
            },
          ]}
          grid={{ horizontal: true }} // Agrega las líneas horizontales de fondo
          height={280}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          sx={{
            // Estilos adicionales para los puntos de la gráfica
            '& .MuiMarkElement-root': {
              fill: '#FFFFFF',
              strokeWidth: 2,
              stroke: '#7FB3D5',
            },
          }}
        />
      </Box>
    </Box>
  );
};