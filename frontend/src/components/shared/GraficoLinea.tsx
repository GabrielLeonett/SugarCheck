import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface GraficoLineaProps {
  data: number[];
  labels: string[];
  color: string;
  label: string;
  height?: number;
  emptyMessage?: string;
}

export function GraficoLinea({
  data,
  labels,
  color,
  label,
  height = 220,
  emptyMessage = 'Sin datos',
}: GraficoLineaProps) {
  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <LineChart
      xAxis={[{ scaleType: 'point', data: labels }]}
      series={[
        {
          data,
          label,
          color,
          curve: 'catmullRom' as const,
        },
      ]}
      sx={{
        '& .MuiLineElement-root': { strokeWidth: 2 },
        '& .MuiMarkElement-root': {
          stroke: color,
          strokeWidth: 2,
          fill: '#ffffff',
          scale: '1.1',
        },
      }}
      height={height}
      margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
    />
  );
}
