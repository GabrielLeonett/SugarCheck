import React, { useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { PhysicalRecord } from '../../../types/types';

interface HistoryChartProps {
  records: PhysicalRecord[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ records }) => {
  const [filter, setFilter] = useState<string>('TODOS');

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  // Simulación del SVG Line Chart limpio según la UI provista
  const points = records.map((r, index) => {
    const x = 50 + index * 130;
    // Invertir el IMC para simular altura en SVG
    const y = 140 - (r.imc - 20) * 12; 
    return { x, y, imc: r.imc };
  });

  const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  // Objeto de estilos reutilizable para evitar duplicación en los ToggleButton
  const toggleButtonSx = {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.75rem',
    border: '1px solid #D5DBDB',
    color: '#7F8C8D',
    padding: '4px 16px',
    '&.Mui-selected': {
      backgroundColor: '#5D9CEC',
      color: '#FFFFFF',
      '&:hover': { 
        backgroundColor: '#4A90E2' 
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: 700 }}>
          Bitácora Histórica de Fortaleza Física
        </Typography>
        <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} size="small">
          <ToggleButton value="TODOS" sx={toggleButtonSx}>
            TODOS
          </ToggleButton>
          <ToggleButton value="TRIMESTRE" sx={toggleButtonSx}>
            TRIMESTRE
          </ToggleButton>
          <ToggleButton value="AÑO" sx={toggleButtonSx}>
            AÑO
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Contenedor del Gráfico SVG */}
      <Box sx={{ width: '100%', overflowX: 'auto', background: '#FFFFFF', borderRadius: '8px', mb: 2 }}>
        <svg width="100%" height="160" viewBox="0 0 600 160" style={{ overflow: 'visible' }}>
          {/* Líneas horizontales de Grid */}
          <line x1="0" y1="30" x2="600" y2="30" stroke="#EAEDED" strokeWidth="1" />
          <line x1="0" y1="70" x2="600" y2="70" stroke="#EAEDED" strokeWidth="1" />
          <line x1="0" y1="110" x2="600" y2="110" stroke="#EAEDED" strokeWidth="1" />
          <line x1="0" y1="150" x2="600" y2="150" stroke="#EAEDED" strokeWidth="1" />

          {/* Línea del Gráfico */}
          <path d={pathD} fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" />

          {/* Puntos y Tooltips Simulados */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#5D9CEC" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  );
};