import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface GraficoBarraProps {
  data: number[];
  labels: string[];
  color: string;
  label: string;
  height?: number;
  emptyMessage?: string;
}

export function GraficoBarra({
  data,
  labels,
  color,
  label,
  height = 220,
  emptyMessage = 'Sin datos',
}: GraficoBarraProps) {
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
    <BarChart
      xAxis={[
        {
          scaleType: 'band',
          data: labels,
          label: undefined,
          tickLabelInterval: () => true,
          tickLabelPlacement: 'middle',
          tickSpacing: 0,
          tickLabelStyle: { fontSize: 11, textAnchor: 'middle' as const },
        },
      ]}
      yAxis={[
        {
          label: undefined,
          tickLabelStyle: { fontSize: 11 },
        },
      ]}
      series={[
        {
          data,
          label,
          color,
          barLabel: 'value',
        },
      ]}
      height={height}
      margin={{ top: 20, bottom: 60, left: 50, right: 40 }}
    />
  );
}