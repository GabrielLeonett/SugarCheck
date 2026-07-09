import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { PhysicalRecord } from '../../../types/types';
import useLanguage from "../../../hooks/useLanguage";

interface HistoryChartProps {
  records: PhysicalRecord[];
}

type FilterType = 'TODOS' | 'TRIMESTRE' | 'AÑO';

export const HistoryChart: React.FC<HistoryChartProps> = ({ records }) => {
  const { t } = useLanguage("monitoreoFisico");
  const theme = useTheme();
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
            color: theme.palette.text.primary, 
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
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }
          }}
        >
          <Button 
            onClick={() => setActiveFilter('TODOS')}
            sx={{ 
              backgroundColor: activeFilter === 'TODOS' ? theme.palette.primary.main : 'transparent',
              color: activeFilter === 'TODOS' ? '#FFFFFF !important' : theme.palette.primary.main,
              '&:hover': { backgroundColor: activeFilter === 'TODOS' ? theme.palette.primary.dark : theme.palette.action.hover }
            }}
          >
            {t("filterAll")}
          </Button>
          <Button 
            onClick={() => setActiveFilter('TRIMESTRE')}
            sx={{ 
              backgroundColor: activeFilter === 'TRIMESTRE' ? theme.palette.primary.main : 'transparent',
              color: activeFilter === 'TRIMESTRE' ? '#FFFFFF !important' : theme.palette.primary.main,
              '&:hover': { backgroundColor: activeFilter === 'TRIMESTRE' ? theme.palette.primary.dark : theme.palette.action.hover }
            }}
          >
            {t("filterQuarter")}
          </Button>
          <Button 
            onClick={() => setActiveFilter('AÑO')}
            sx={{ 
              backgroundColor: activeFilter === 'AÑO' ? theme.palette.primary.main : 'transparent',
              color: activeFilter === 'AÑO' ? '#FFFFFF !important' : theme.palette.primary.main,
              '&:hover': { backgroundColor: activeFilter === 'AÑO' ? theme.palette.primary.dark : theme.palette.action.hover }
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
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
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
              tickLabelStyle: { fill: theme.palette.text.secondary, fontSize: 12 }
            }
          ]}
          yAxis={[
            {
              min: Math.min(...weightData) - 5,
              max: Math.max(...weightData) + 5,
              tickLabelStyle: { fill: theme.palette.text.secondary, fontSize: 12 }
            }
          ]}
          series={[
            {
              data: weightData,
              color: theme.palette.primary.main,
              showMark: true,
              curve: 'linear',
            },
          ]}
          grid={{ horizontal: true }}
          height={280}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          sx={{
            '& .MuiMarkElement-root': {
              fill: theme.palette.background.paper,
              strokeWidth: 2,
              stroke: theme.palette.primary.main,
            },
          }}
        />
      </Box>
    </Box>
  );
};