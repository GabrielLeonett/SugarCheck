import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import type { PhysicalEvolution } from '../../../types/types';
import { CardBase } from '../../../components/ui/Cards/fdhjasfdasdfalsk'

interface MetricCardProps {
  type: 'balance' | 'evolution';
  currentImc?: number;
  evolutionData?: PhysicalEvolution;
}

// Estilos base reutilizables mediante el objeto sx
const titleSx = {
  color: '#2C3E50',
  fontWeight: 700,
  fontSize: '1.1rem',
  textAlign: 'center',
  marginBottom: '16px',
};

const bigValueSx = (color = '#2ECC71') => ({
  fontSize: '3.5rem',
  fontWeight: 800,
  textAlign: 'center',
  lineHeight: 1,
  color: color,
});

export const MetricCard: React.FC<MetricCardProps> = ({ type, currentImc = 0, evolutionData }) => {
  if (type === 'balance') {
    return (
      <CardBase sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Typography sx={titleSx}>Balance de Fortaleza Física</Typography>
        <Typography sx={bigValueSx()}>{currentImc.toFixed(1)}</Typography>
        <ProgressBar value={currentImc} />
      </CardBase>
    );
  }

  const pesoSign = evolutionData && evolutionData.pesoDiff > 0 ? '+' : '';
  const tallaSign = evolutionData && evolutionData.estaturaDiff > 0 ? '+' : '';

  return (
    <CardBase sx={{ py: 4 }}>
      <Typography sx={titleSx}>Evolución Física</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', my: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={bigValueSx('#2ECC71')}>
            {pesoSign}{evolutionData?.pesoDiff} Kg
          </Typography>
          <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mt: 1 }}>
            Diferencia de Peso
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={bigValueSx('#2ECC71')}>
            {tallaSign}{evolutionData?.estaturaDiff} cm
          </Typography>
          <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mt: 1 }}>
            Crecimiento Logrado
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#95A5A6', mt: 3 }}>
        Evolución con respecto al registro anterior ({evolutionData?.fechaReferencia}).
      </Typography>
    </CardBase>
  );
};