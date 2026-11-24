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

  // Cada registro debe ocupar su propia categoría aunque dos compartan la misma
  // etiqueta (dos tomas a la misma hora, por ejemplo). Si se pasan las horas
  // repetidas como datos del eje, el gráfico las agrupa en una sola barra.
  const categories = data.map((_, index) => index);
  const rotateLabels = labels.length > 6;

  return (
    <BarChart
      xAxis={[
        {
          scaleType: 'band',
          data: categories,
          valueFormatter: (value) => labels[Number(value)] ?? String(value),
          label: undefined,
          tickLabelInterval: 'auto',
          tickLabelPlacement: 'middle',
          tickSpacing: 0,
          tickLabelStyle: {
            fontSize: 11,
            angle: rotateLabels ? -35 : 0,
            textAnchor: rotateLabels ? 'end' : 'middle',
          },
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
      margin={{ top: 20, bottom: rotateLabels ? 85 : 60, left: 50, right: 40 }}
    />
  );
}