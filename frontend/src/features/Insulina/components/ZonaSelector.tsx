import { useState } from 'react';
import { Box, Button, Grid, Paper, Typography, useTheme } from '@mui/material';
import { FormHelperText } from '@mui/material';
import useLanguage from '../../../hooks/useLanguage';
import { ZONA_MAP, type ZonaBackend } from '../../../schemas/insulina';

interface ZonaSelectorProps {
  value: ZonaBackend | '';
  onChange: (zona: ZonaBackend) => void;
  error?: boolean;
}

const FRENTE: ZonaBackend[] = ['ABDOMEN_DERECHO', 'ABDOMEN_IZQUIERDO', 'MUSLO_DERECHO', 'MUSLO_IZQUIERDO'];
const ATRAS: ZonaBackend[] = ['BRAZO_DERECHO', 'BRAZO_IZQUIERDO', 'GLUTEO_DERECHO', 'GLUTEO_IZQUIERDO'];

export default function ZonaSelector({ value, onChange, error }: ZonaSelectorProps) {
  const theme = useTheme();
  const { t } = useLanguage('insulina');
  const [vista, setVista] = useState<'FRENTE' | 'ATRÁS'>('FRENTE');

  const zonasActuales = vista === 'FRENTE' ? FRENTE : ATRAS;

  const getZonaColor = (zona: string, esSeleccionado: boolean) => {
    if (!esSeleccionado) return 'transparent';
    if (zona.includes('ABDOMEN')) return theme.palette.error.main;
    if (zona.includes('GLUTEO')) return theme.palette.success.main;
    if (zona.includes('MUSLO')) return theme.palette.warning.main;
    if (zona.includes('BRAZO')) return '#f97316';
    return theme.palette.text.secondary;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>
          {t('applicationZone')}
        </Typography>
        <Box sx={{ display: 'inline-flex', borderRadius: 2, bgcolor: theme.palette.action.hover, p: 0.5 }}>
          <Button
            size="small"
            onClick={() => setVista('FRENTE')}
            sx={{
              bgcolor: vista === 'FRENTE' ? theme.palette.primary.main : 'transparent',
              color: vista === 'FRENTE' ? theme.palette.primary.contrastText : theme.palette.text.secondary,
              borderRadius: 1, px: 2, py: 0.5, fontSize: '0.75rem', textTransform: 'none',
            }}
          >
            {t('front')}
          </Button>
          <Button
            size="small"
            onClick={() => setVista('ATRÁS')}
            sx={{
              bgcolor: vista === 'ATRÁS' ? theme.palette.primary.main : 'transparent',
              color: vista === 'ATRÁS' ? theme.palette.primary.contrastText : theme.palette.text.secondary,
              borderRadius: 1, px: 2, py: 0.5, fontSize: '0.75rem', textTransform: 'none',
            }}
          >
            {t('back')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={1.5}>
        {zonasActuales.map((zona) => {
          const esSeleccionado = value === zona;
          const color = getZonaColor(zona, esSeleccionado);
          return (
            <Grid size={{ xs: 6 }} key={zona}>
              <Paper
                onClick={() => onChange(zona)}
                elevation={esSeleccionado ? 3 : 1}
                sx={{
                  p: 1.5, textAlign: 'center', borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s',
                  bgcolor: esSeleccionado ? color : theme.palette.background.default,
                  color: esSeleccionado ? theme.palette.common.white : theme.palette.text.secondary,
                  border: esSeleccionado ? `2px solid ${color}` : `1px solid ${theme.palette.divider}`,
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: esSeleccionado ? 'bold' : 'normal', fontSize: '0.8rem' }}>
                  {t(ZONA_MAP[zona])}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {t('pleaseSelectZone')}
        </FormHelperText>
      )}
    </Box>
  );
}