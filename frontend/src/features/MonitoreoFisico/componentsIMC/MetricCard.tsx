import React from 'react';
import { Box, Typography, Divider, useTheme } from '@mui/material';
import { CardBase } from '../componentsIMC/CardBase';
import type { PhysicalEvolution } from '../../../types/types';
import useLanguage from "../../../hooks/useLanguage";

interface MetricCardProps {
  type: 'balance' | 'evolution';
  currentImc?: number;
  evolutionData?: PhysicalEvolution;
}

export const MetricCard: React.FC<MetricCardProps> = ({ type, currentImc, evolutionData }) => {
  const { t } = useLanguage("monitoreoFisico");
  const theme = useTheme();
  // Renderizado para la tarjeta de Balance de Fortaleza Física
  if (type === 'balance') {
    let color = '#27AE60'; // Verde (Normal)
    if (currentImc && currentImc < 18.5) {
      color = '#3498DB'; // Azul (Bajo peso)
    } else if (currentImc && currentImc >= 25) {
      color = '#E67E22'; // Naranja (Sobrepeso)
    }

    return (
      <CardBase>
        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, textAlign: 'center', mb: 2 }}>
{t("balanceTitle")}
        </Typography>
        
        <Typography variant="h2" sx={{ color: color, fontWeight: 800, textAlign: 'center', mb: 3 }}>
          {currentImc?.toFixed(1) || '0.0'}
        </Typography>

        <Box sx={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', mb: 1, gap: '2px' }}>
          <Box sx={{ flex: 1, backgroundColor: '#3498DB', opacity: (currentImc && currentImc < 18.5) ? 1 : 0.4 }} />
          <Box sx={{ flex: 1, backgroundColor: '#27AE60', opacity: (currentImc && currentImc >= 18.5 && currentImc < 25) ? 1 : 0.4 }} />
          <Box sx={{ flex: 1, backgroundColor: '#E67E22', opacity: (currentImc && currentImc >= 25) ? 1 : 0.4 }} />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontWeight: (currentImc && currentImc < 18.5) ? 700 : 400 }}>{t("statusUnderweight")}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontWeight: (currentImc && currentImc >= 18.5 && currentImc < 25) ? 700 : 400 }}>{t("statusNormal")}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontWeight: (currentImc && currentImc >= 25) ? 700 : 400 }}>{t("statusOverweight")}</Typography>
        </Box>
      </CardBase>
    );
  }

  if (type === 'evolution' && evolutionData) {
    return (
      <CardBase>
        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, textAlign: 'center', mb: 3 }}>
{t("evolutionTitle")}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: evolutionData.pesoDiff <= 0 ? '#27AE60' : '#E74C3C', fontWeight: 800 }}>
              {evolutionData.pesoDiff > 0 ? '+' : ''}{evolutionData.pesoDiff} Kg
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.primary, fontWeight: 700 }}>
{t("weightDiff")}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: evolutionData.estaturaDiff > 0 ? '#27AE60' : theme.palette.text.secondary, fontWeight: 800 }}>
              {evolutionData.estaturaDiff > 0 ? '+' : ''}{evolutionData.estaturaDiff} cm
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.primary, fontWeight: 700 }}>
{t("heightGrowth")}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />
        <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, textAlign: 'center' }}>
          {t("evolutionDesc", { date: evolutionData?.fechaReferencia })}
        </Typography>
      </CardBase>
    );
  }

  return null;
};