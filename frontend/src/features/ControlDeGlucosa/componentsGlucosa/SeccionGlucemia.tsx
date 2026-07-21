import AddIcon from '@mui/icons-material/Add';
import {
  Box, Typography, Grid, LinearProgress, Button, ButtonGroup, Alert, CircularProgress,
} from '@mui/material';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase.tsx';
import { CardBase } from '../../../components/ui/Cards/CardBase.tsx';
import ModalGlucosaForm from '../../../components/shared/ModalGlucosaForm.tsx';
import HistorialTable from '../../../components/shared/HistorialTable';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import { GraficoLinea } from '../../../components/shared/GraficoLinea';
import { obtenerColorEstado, type UseGlucosaDataReturn } from '../../../hooks/useGlucosaData.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';

import type { GlucosaData } from '../../../schemas/glucosa';
import type { GlucosaRecord } from '../../../data/recordsMock';
import type { Column } from '../../../components/shared/HistorialTable';

interface SeccionGlucemiaProps {
  dataHook: UseGlucosaDataReturn;
  onSaveGlucosa: (data: GlucosaData) => void;
}

export function SeccionGlucemia({ dataHook, onSaveGlucosa }: SeccionGlucemiaProps) {
  const { t } = useLanguage("glucemia");

  const formatDate = (iso: string) => {
    const [aaaa, mm, dd] = iso.split('T')[0].split('-');
    return `${dd}/${mm}/${aaaa}`;
  };

  const columns: Column<GlucosaRecord>[] = [
    { key: 'fecha', label: t('tabla.headers.fecha'), render: (row) => formatDate(row.fechaISO) },
    { key: 'hora', label: t('tabla.headers.hora'), render: (row) => row.hora },
    { key: 'nivel', label: t('tabla.headers.nivel'), render: (row) => row.nivel },
    { key: 'contexto', label: t('tabla.headers.contexto'), render: (row) => row.contexto },
    {
      key: 'estado', label: t('tabla.headers.estado'),
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: obtenerColorEstado(row.estado) }}>
          {row.estado}
        </Box>
      ),
    },
  ];

  const chartComponent = (
    <GraficoLinea
      data={dataHook.nivelesGlucosa}
      labels={dataHook.horasGlucosa}
      color="#94c2e6"
      label={t('grafico.labelSerie')}
      emptyMessage={t('grafico.sinDatos')}
    />
  );

  const filterComponent = (
    <ButtonGroup variant="outlined" size="small" aria-label={t('grafico.filtros.ariaLabel')} sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}>
      {(['hoy', 'semana', 'mes'] as const).map((filtro) => (
        <Button
          key={filtro}
          onClick={() => { dataHook.setFiltroGlucosa(filtro); dataHook.setPageGlucosa(0); }}
          variant={dataHook.filtroGlucosa === filtro ? 'contained' : 'outlined'}
        >
          {t(`grafico.filtros.${filtro}`)}
        </Button>
      ))}
    </ButtonGroup>
  );

  if (dataHook.error && dataHook.glucosaFiltrada.length === 0) {
    return (
      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
          {t('titleMonitoreo')}
        </Typography>
        <Alert severity="error">{dataHook.error}</Alert>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ mb: 6 }}>
      <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
        {t('titleMonitoreo')}
        {dataHook.loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Typography>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Métricas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ButtonBase onClick={dataHook.handleOpenGlucosa} startIcon={<AddIcon />} disabled={dataHook.loading}> 
              {t('btnRegistrar')}
            </ButtonBase>

            <ModalGlucosaForm 
              open={dataHook.openGlucosa}
              onClose={dataHook.handleCloseGlucosa}
              onSave={onSaveGlucosa}
            />

            {/* Dominio de la Zona Segura (oculta hasta tener >= 2 registros) */}
            {dataHook.hasGlucosaData && (
              <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center"}}>
                  {t('zonaSegura.title')}
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: "error.light", textAlign: "center" }}>
                  {dataHook.porcentajeZonaSegura}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
                  {t('zonaSegura.caption')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: "error.light" }}>
                  {dataHook.porcentajeZonaSegura < 50 ? t('zonaSegura.alertaBaja') : t('zonaSegura.alertaNormal')}
                </Typography>
              </CardBase>
            )}
            
            {/* Frecuencia de Alertas */}
            <CardBase sx={{ display: "flex", flexDirection: "column", p: 3, width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center", mb: 3, color: "text.primary" }}>
                {t('frecuenciaAlertas.title')}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.hiperglucemias')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={dataHook.porcentajeHiper} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'warning.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${dataHook.porcentajeHiper}% - 20px)`, color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantHiperglucemias}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.hipoglucemias')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={dataHook.porcentajeHipo} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'info.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${dataHook.porcentajeHipo}% - 20px)`, color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantHipoglucemias}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.enRango')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={dataHook.porcentajeEnRango} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'success.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${dataHook.porcentajeEnRango}% - 20px)`, color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantEnRango}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardBase>
          </Box>
        </Grid>

        {/* Columna Derecha: Gráfico con Filtros e Historial */}
        <Grid size={{ xs: 12, md: 7 }}>
          <PanelGraficoHistorial
            chartTitle={t('grafico.title')}
            filterComponent={filterComponent}
            chartComponent={chartComponent}
            tableTitle={t('tabla.title')}
            tableComponent={
              <HistorialTable<GlucosaRecord>
                columns={columns}
                data={[...dataHook.glucosaFiltrada].reverse()}
                page={dataHook.pageGlucosa}
                rowsPerPage={dataHook.rowsPerPageGlucosa}
                totalCount={dataHook.glucosaFiltrada.length}
                onPageChange={(_, newPage) => dataHook.setPageGlucosa(newPage)}
                onRowsPerPageChange={(e) => {
                  dataHook.setRowsPerPageGlucosa(parseInt(e.target.value, 10));
                  dataHook.setPageGlucosa(0);
                }}
                emptyMessage={t('tabla.sinDatos')}
                labelRowsPerPage={t('tabla.paginacion.filasPorPagina')}
                ariaLabel={t('tabla.ariaLabel')}
              />
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}