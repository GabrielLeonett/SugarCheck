import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Grid, useTheme, Alert, ButtonGroup, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// UI Components
import { Modal } from '../../../components/ui/Modals/Modals';

// Feature Components
import { MetricCard } from '../componentsIMC/MetricCard';
import { RegisterMeasurementModal } from '../componentsIMC/RegistrarMedidaModal';
import type { PhysicalRecord, PhysicalEvolution } from '../../../types/types';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import { CardBase } from '../../../components/ui/Cards/CardBase';
import HistorialTable from '../../../components/shared/HistorialTable';
import type { Column } from '../../../components/shared/HistorialTable';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import { GraficoLinea } from '../../../components/shared/GraficoLinea';
import useMetricData from '../../../hooks/useMetricData';
import Navbar from '../../../components/layout/Header/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import useLanguage from "../../../hooks/useLanguage";
import { imcApi } from '../../../apis/monitoreo_fisico';

export const PhysicalMonitoringPage: React.FC = () => {
  const { t } = useLanguage("monitoreoFisico");
  const theme = useTheme();
  const [records, setRecords] = useState<PhysicalRecord[]>([]);
  const [evolution, setEvolution] = useState<PhysicalEvolution>({ pesoDiff: 0, estaturaDiff: 0, fechaReferencia: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setError(null);
      const data = await imcApi.getAll();
      setRecords(data);
      if (data.length >= 2) {
        const last = data[0];
        const prev = data[1];
        setEvolution({
          pesoDiff: +((last.peso - prev.peso).toFixed(1)),
          estaturaDiff: +((last.estatura - prev.estatura).toFixed(1)),
          fechaReferencia: prev.fecha,
        });
      } else if (data.length === 1) {
        setEvolution({ pesoDiff: 0, estaturaDiff: 0, fechaReferencia: data[0].fecha });
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar registros');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveMeasurement = async (newData: { peso: number; estatura: number; fecha: string }) => {
    const [dd, mm, aaaa] = newData.fecha.split('/');
    try {
      setError(null);
      const created = await imcApi.create({
        peso: newData.peso,
        altura: newData.estatura,
        dia: parseInt(dd),
        mes: parseInt(mm),
        anio: parseInt(aaaa),
      });
      setRecords([created, ...records]);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    }
  };

  const currentImc = records[0]?.imc || 0;

  function convertirFecha(fechaDDMMAAAA: string): string {
    const [dd, mm, aaaa] = fechaDDMMAAAA.split('/');
    return `${aaaa}-${mm}-${dd}`;
  }

  type EnrichedPhysicalRecord = PhysicalRecord & { fechaISO: string; };

  const enrichedRecords = useMemo<EnrichedPhysicalRecord[]>(
    () =>
      records.map((r) => ({
        ...r,
        fechaISO: convertirFecha(r.fecha),
      })),
    [records]
  );

  const imcData = useMetricData<EnrichedPhysicalRecord>(enrichedRecords, 'todos', {
    initialRowsPerPage: 4,
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Normal': return '#27AE60';
      case 'Sobrepeso': return '#E67E22';
      case 'Bajo peso': return '#3498DB';
      default: return '#34495E';
    }
  };

  const columns: Column<EnrichedPhysicalRecord>[] = [
    { key: 'fecha', label: t('tableFecha'), render: (row) => row.fecha },
    { key: 'peso', label: t('tablePeso'), render: (row) => row.peso },
    { key: 'estatura', label: t('tableEstatura'), render: (row) => row.estatura },
    { key: 'imc', label: t('tableImc'), render: (row) => row.imc.toFixed(1) },
    {
      key: 'estado', label: t('tableEstado'),
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: getStatusColor(row.estado) }}>
          {row.estado}
        </Box>
      ),
    },
  ];

  const filterComponent = (
    <ButtonGroup variant="outlined" size="small" sx={{ alignSelf: { xs: 'center', sm: 'auto', textTransform: 'none' } }}>
      {(['todos', 'trimestre', 'año'] as const).map((f) => (
        <Button
          key={f}
          onClick={() => imcData.setTimeRange(f)}
          variant={imcData.timeRange === f ? 'contained' : 'outlined'}
          sx={{  }}
        >
          {f === 'todos' ? t('filterAll') : f === 'año' ? t('filterYear') : t('filterQuarter')}
        </Button>
      ))}
    </ButtonGroup>
  );

  const chartComponent = (
    <GraficoLinea
      data={imcData.filteredData.map((r) => r.imc)}
      labels={imcData.filteredData.map((r) => r.fecha)}
      color={theme.palette.primary.main}
      label="IMC"
    />
  );

  return (
    <>
      <Navbar/>
      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 }, minHeight: 'calc(100vh - 130px)' }}>
        <Box sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Typography
            variant="h3"
            color="primary.main"
            sx={{ fontWeight: 700, mb: 8, textAlign: 'center' }}
          >
            {t("pageTitle")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ButtonBase 
                startIcon={<AddIcon />} 
                onClick={handleOpenModal}
                fullWidth
                disabled={isLoading}
              >
                {t("registerButton")}
              </ButtonBase>
              
              <MetricCard type="balance" currentImc={currentImc} />
              
              <MetricCard type="evolution" evolutionData={evolution} />
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              {isLoading ? (
                <CardBase>
                  <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    {t("loading")}
                  </Typography>
                </CardBase>
              ) : (
                <PanelGraficoHistorial
                  chartTitle={t("chartTitle")}
                  filterComponent={filterComponent}
                  chartComponent={chartComponent}
                  tableTitle="Historial de registros"
                  tableComponent={
                    <HistorialTable<EnrichedPhysicalRecord>
                      columns={columns}
                      data={[...imcData.filteredData].reverse()}
                      page={imcData.page}
                      rowsPerPage={imcData.rowsPerPage}
                      totalCount={imcData.filteredData.length}
                      onPageChange={imcData.handleChangePage}
                      onRowsPerPageChange={imcData.handleChangeRowsPerPage}
                      rowsPerPageOptions={[4, 8, 12]}
                      emptyMessage="No hay registros"
                      labelRowsPerPage={t("rowsPerPage")}
                      ariaLabel="Bitácora histórica"
                    />
                  }
                />
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <RegisterMeasurementModal onClose={handleCloseModal} onSave={handleSaveMeasurement} />
      </Modal>
      <Footer/>
    </>
  );
};