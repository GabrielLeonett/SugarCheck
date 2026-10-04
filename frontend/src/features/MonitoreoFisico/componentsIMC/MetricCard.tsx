import React from 'react';
import { Box, Typography, Divider, useTheme } from '@mui/material';
import { CardBase } from '../../../components/ui/Cards/CardBase';
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

  if (type === 'balance') {
    let color = '#27AE60';
    if (currentImc && currentImc < 18.5) {
      color = '#3498DB';
    } else if (currentImc && currentImc >= 25) {
      color = '#E67E22';
    }

    return (
      <CardBase sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center' }}>
          {t("balanceTitle")}
        </Typography>

        <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: color, textAlign: 'center' }}>
          {currentImc?.toFixed(1) || '0.0'}
        </Typography>

        <Box sx={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', mt: 3, mb: 1, gap: '2px', width: '100%' }}>
          <Box sx={{ flex: 1, backgroundColor: '#3498DB', opacity: (currentImc && currentImc < 18.5) ? 1 : 0.4 }} />
          <Box sx={{ flex: 1, backgroundColor: '#27AE60', opacity: (currentImc && currentImc >= 18.5 && currentImc < 25) ? 1 : 0.4 }} />
          <Box sx={{ flex: 1, backgroundColor: '#E67E22', opacity: (currentImc && currentImc >= 25) ? 1 : 0.4 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {(['Bajo peso', 'Normal', 'Sobrepeso'] as const).map((label) => {
            const isActive =
              (label === 'Bajo peso' && currentImc && currentImc < 18.5) ||
              (label === 'Normal' && currentImc && currentImc >= 18.5 && currentImc < 25) ||
              (label === 'Sobrepeso' && currentImc && currentImc >= 25);
            return (
              <Typography
                key={label}
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: isActive ? 700 : 400 }}
              >
                {label}
              </Typography>
            );
          })}
        </Box>
      </CardBase>
    );
  }

  if (type === 'evolution' && evolutionData) {
    return (
      <CardBase sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
          {t("evolutionTitle")}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: evolutionData.pesoDiff <= 0 ? '#27AE60' : '#E74C3C', fontWeight: 800 }}>
              {evolutionData.pesoDiff > 0 ? '+' : ''}{evolutionData.pesoDiff} Kg
            </Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
              {t("weightDiff")}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: evolutionData.estaturaDiff > 0 ? '#27AE60' : theme.palette.text.secondary, fontWeight: 800 }}>
              {evolutionData.estaturaDiff > 0 ? '+' : ''}{evolutionData.estaturaDiff} cm
            </Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
              {t("heightGrowth")}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: theme.palette.divider, width: '100%' }} />
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t("evolutionDesc", { date: evolutionData?.fechaReferencia })}
        </Typography>
      </CardBase>
    );
  }

  return null;
};