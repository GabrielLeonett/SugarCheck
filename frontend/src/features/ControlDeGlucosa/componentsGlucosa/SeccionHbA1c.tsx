import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, Grid, ButtonGroup, Button, Alert, CircularProgress } from '@mui/material';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase.tsx';
import { CardBase } from '../../../components/ui/Cards/CardBase.tsx';
import ModalHbA1cForm from '../../../components/shared/ModalHbA1cForm.tsx';
import HistorialTable from '../../../components/shared/HistorialTable';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import { GraficoBarra } from '../../../components/shared/GraficoBarra';
import { obtenerColorEstado, type UseGlucosaDataReturn } from '../../../hooks/useGlucosaData.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';
import type { HbA1cData } from '../../../schemas/hba1c';
import type { HbA1cRecord } from '../../../data/recordsMock';
import type { Column } from '../../../components/shared/HistorialTable';

interface SeccionHbA1cProps {
  dataHook: UseGlucosaDataReturn;
  onSaveHbA1c: (data: HbA1cData) => void;
}

export function SeccionHbA1c({ dataHook, onSaveHbA1c }: SeccionHbA1cProps) {
  const { t } = useLanguage("glicosilada");

  const columns: Column<HbA1cRecord>[] = [
    { key: 'fecha', label: t('tabla.headers.fecha'), render: (row) => row.fecha },
    {
      key: 'resultado', label: t('tabla.headers.resultado'),
      render: (row) => (typeof row.resultado === 'number' ? `${row.resultado} %` : row.resultado),
    },
    { key: 'estimado', label: t('tabla.headers.estimado'), render: (row) => row.estimado },
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
    <GraficoBarra
      data={dataHook.resultadosHbA1c}
      labels={dataHook.fechasHbA1c}
      color="#81c784"
      label={t('grafico.labelSerie')}
      emptyMessage={t('grafico.sinDatos')}
    />
  );

  const filterComponent = (
    <ButtonGroup variant="outlined" size="small" aria-label={t('grafico.filtros.ariaLabel')} sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}>
      <Button
        onClick={() => { dataHook.setFiltroHbA1c('todos'); dataHook.setPageHbA1c(0); }}
        variant={dataHook.filtroHbA1c === 'todos' ? 'contained' : 'outlined'}
      >
        {t('grafico.filtros.todos')}
      </Button>
      <Button
        onClick={() => { dataHook.setFiltroHbA1c('trimestre'); dataHook.setPageHbA1c(0); }}
        variant={dataHook.filtroHbA1c === 'trimestre' ? 'contained' : 'outlined'}
      >
        {t('grafico.filtros.trimestre')}
      </Button>
      <Button
        onClick={() => { dataHook.setFiltroHbA1c('año'); dataHook.setPageHbA1c(0); }}
        variant={dataHook.filtroHbA1c === 'año' ? 'contained' : 'outlined'}
      >
        {t('grafico.filtros.año')}
      </Button>
      
    </ButtonGroup>
  );

  if (dataHook.error && dataHook.hbA1cFiltrada.length === 0) {
    return (
      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
          {t('titleHistorial')}
        </Typography>
        <Alert severity="error">{dataHook.error}</Alert>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ mb: 6 }}>
      <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
        {t('titleHistorial')}
        {dataHook.loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ButtonBase onClick={dataHook.handleOpenHbA1c} startIcon={<AddIcon />} disabled={dataHook.loading}>
              {t('btnRegistrar')}
            </ButtonBase>

            <ModalHbA1cForm
              open={dataHook.openHbA1c}
              onClose={dataHook.handleCloseHbA1c}
              onSave={onSaveHbA1c}
            />

            <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('ultimoResultado.title')}
              </Typography>

              {dataHook.ultimoResultadoHbA1c ? (
                <>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 700, color: dataHook.enRangoObjetivo ? 'success.light' : 'warning.light' }}
                  >
                    {`${dataHook.ultimoResultadoHbA1c}%`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('ultimoResultado.estimado', { valor: dataHook.ultimoEag })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: dataHook.enRangoObjetivo ? 'success.light' : 'warning.light' }}
                  >
                    {dataHook.enRangoObjetivo ? t('ultimoResultado.enRango') : t('ultimoResultado.fueraRango')}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('ultimoResultado.sinDatos')}
                </Typography>
              )}
            </CardBase>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <PanelGraficoHistorial
            chartTitle={t('grafico.title')}
            filterComponent={filterComponent}
            chartComponent={chartComponent}
            tableTitle={t('tabla.title')}
            tableComponent={
              <HistorialTable<HbA1cRecord>
                columns={columns}
                data={[...dataHook.hbA1cFiltrada].reverse()}
                page={dataHook.pageHbA1c}
                rowsPerPage={dataHook.rowsPerPageHbA1c}
                totalCount={dataHook.hbA1cFiltrada.length}
                onPageChange={(_, newPage) => dataHook.setPageHbA1c(newPage)}
                onRowsPerPageChange={(e) => {
                  dataHook.setRowsPerPageHbA1c(parseInt(e.target.value, 10));
                  dataHook.setPageHbA1c(0);
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
