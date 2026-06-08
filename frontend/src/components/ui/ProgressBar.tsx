import React from 'react';
import { Box, Typography, styled } from '@mui/material';

interface ProgressBarProps {
  value: number;
}

const TrackContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '8px',
  borderRadius: '4px',
  display: 'flex',
  marginTop: '24px',
  marginBottom: '16px',
}));

const Segment = styled(Box)<{ bg: string }>(({ bg }) => ({
  flex: 1,
  backgroundColor: bg,
  '&:first-of-type': { borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' },
  '&:last-of-type': { borderTopRightRadius: '4px', borderBottomRightRadius: '4px' },
}));

const Indicator = styled(Box)<{ percentage: number }>(({ percentage }) => ({
  position: 'absolute',
  top: '-4px',
  left: `${percentage}%`,
  width: '16px',
  height: '16px',
  backgroundColor: '#5D6D7E',
  border: '3px solid #FFFFFF',
  borderRadius: '50%',
  transform: 'translateX(-50%)',
  boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
  transition: 'left 0.5s ease-out',
}));

const LabelContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
}));

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  // Mapear IMC (rango visible estándar de 15 a 35) a porcentaje (0% - 100%)
  const minImc = 15;
  const maxImc = 35;
  const percentage = Math.min(Math.max(((value - minImc) / (maxImc - minImc)) * 100, 0), 100);

  return (
    <Box width="100%">
      <TrackContainer>
        <Segment bg="#3498DB" /> {/* Bajo Peso */}
        <Segment bg="#2ECC71" /> {/* Normal */}
        <Segment bg="#E67E22" /> {/* Sobrepeso */}
        <Indicator percentage={percentage} />
      </TrackContainer>
      <LabelContainer>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontWeight: 600 }}>Bajo peso</Typography>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontWeight: 600 }}>Normal</Typography>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontWeight: 600 }}>Sobrepeso</Typography>
      </LabelContainer>
    </Box>
  );
};