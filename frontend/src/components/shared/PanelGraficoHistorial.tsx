import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CardBase } from '../ui/Cards/CardBase';

interface PanelGraficoHistorialProps {
  chartTitle: string;
  filterComponent: ReactNode;
  chartComponent: ReactNode;
  tableTitle: string;
  tableComponent: ReactNode;
}

export function PanelGraficoHistorial({
  chartTitle,
  filterComponent,
  chartComponent,
  tableTitle,
  tableComponent,
}: PanelGraficoHistorialProps) {
  return (
    <CardBase
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 560,
        height: '100%',
        p: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1,
        }}
      > 
        <Typography
          variant="h6"
          color="primary.dark"
          sx={{ fontWeight: 600, my: 4, textAlign: { xs: 'center', sm: 'left' } }}
        >
          {tableTitle}
        </Typography>
        {filterComponent}
      </Box>
      

      {tableComponent}

        <Typography
          variant="h6"
          color="primary.dark"
          sx={{ fontWeight: 600, my: 3, textAlign: { xs: 'center', sm: 'left' } }}
        >
          {chartTitle}
        </Typography>

      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          height: 220,
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {chartComponent}
      </Box>

    </CardBase>
  );
}
