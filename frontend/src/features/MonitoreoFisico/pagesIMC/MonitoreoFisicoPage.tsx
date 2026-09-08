import React from 'react';
import { Box, Typography, Grid, ButtonGroup, Button, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../../../components/layout/Header/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import { CardBase } from '../../../components/ui/Cards/CardBase';
import ModalImcForm from '../../../components/shared/ModalImcForm';
import HistorialTable from '../../../components/shared/HistorialTable';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import { GraficoBarra } from '../../../components/shared/GraficoBarra';
import { useImcData } from '../../../hooks/useImcData';
import useLanguage from '../../../hooks/useLanguage';
import type { ImcRecord } from '../../../data/recordsMock';
import type { Column } from '../../../components/shared/HistorialTable';

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case 'Normal': return 'success.light';
    case 'Sobrepeso': return 'warning.light';
    case 'Bajo peso': return 'info.light';
    default: return 'text.primary';
  }
}

const formatDate = (iso: string) => {
  const [aaaa, mm, dd] = iso.split('T')[0].split('-');
  return `${dd}/${mm}/${aaaa}`;
};

export const PhysicalMonitoringPage: React.FC = () => {
  const { t } = useLanguage('monitoreoFisico');
  const imc = useImcData();

  const columns: Column<ImcRecord>[] = [
    { key: 'fecha', label: t('tableFecha'), render: (row) => formatDate(row.fechaISO) },
    { key: 'peso', label: t('tablePeso'), render: (row) => row.peso },
    { key: 'estatura', label: t('tableEstatura'), render: (row) => row.estatura },
    { key: 'imc', label: t('tableImc'), render: (row) => row.imc.toFixed(1) },
    {
      key: 'estado', label: t('tableEstado'),
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: obtenerColorEstado(row.estado) }}>
          {row.estado}
        </Box>
      ),
    },
  ];

  const chartComponent = (
    <GraficoBarra
      data={imc.pesos}
      labels={imc.fechas.map((f) => formatDate(f))}
      color="#94c2e6"
      label="Peso (Kg)"
      emptyMessage="Sin datos"
    />
  );

  const filterComponent = (
    <ButtonGroup variant="outlined" size="small" aria-label="Filtros">
      {(['todos', 'trimestre', 'año'] as const).map((filtro) => (
        <Button
          key={filtro}
          onClick={() => { imc.setFiltro(filtro); imc.setPage(0); }}
          variant={imc.filtro === filtro ? 'contained' : 'outlined'}
        >
          {filtro === 'todos' ? t('filterAll') : filtro === 'trimestre' ? t('filterQuarter') : t('filterYear')}
        </Button>
      ))}
    </ButtonGroup>
  );

  if (imc.error && imc.records.length === 0) {
    return (
      <>
        <Navbar />
        <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 }, minHeight: 'calc(100vh - 130px)' }}>
          <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: 'center' }}>
            {t('pageTitle')}
          </Typography>
          <Alert severity="error">{imc.error}</Alert>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 }, minHeight: 'calc(100vh - 130px)' }}>
        <Box sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: 'center' }}>
            {t('pageTitle')}
            {imc.loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <ButtonBase onClick={imc.handleOpenModal} startIcon={<AddIcon />} disabled={imc.loading}>
                  {t('registerButton')}
                </ButtonBase>

                {imc.ultimoImc !== null && (
                  <CardBase sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('balanceTitle')}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: obtenerColorEstado(imc.ultimaCategoria || '') }}>
                      {imc.ultimoImc.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: obtenerColorEstado(imc.ultimaCategoria || '') }}>
                      {imc.ultimaCategoria}
                    </Typography>
                  </CardBase>
                )}

                {imc.records.length >= 2 && (
                  <CardBase sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('evolutionTitle')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.light' }}>
                      {imc.records[0].peso - imc.records[1].peso > 0 ? '+' : ''}
                      {(imc.records[0].peso - imc.records[1].peso).toFixed(1)} Kg
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('weightDiff')}
                    </Typography>
                  </CardBase>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <PanelGraficoHistorial
                chartTitle={t('chartTitle')}
                filterComponent={filterComponent}
                chartComponent={chartComponent}
                tableTitle="Historial"
                tableComponent={
                  <HistorialTable<ImcRecord>
                    columns={columns}
                    data={[...imc.records].reverse()}
                    page={imc.page}
                    rowsPerPage={imc.rowsPerPage}
                    totalCount={imc.records.length}
                    onPageChange={(_, newPage) => imc.setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      imc.setRowsPerPage(parseInt(e.target.value, 10));
                      imc.setPage(0);
                    }}
                    emptyMessage="Sin registros"
                    labelRowsPerPage={t('rowsPerPage')}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <ModalImcForm
        open={imc.openModal}
        onClose={imc.handleCloseModal}
        onSave={imc.handleSave}
      />
      <Footer />
    </>
  );
}
