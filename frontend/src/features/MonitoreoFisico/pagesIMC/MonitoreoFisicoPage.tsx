import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, useTheme, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// UI Components
import { Modal } from '../../../components/ui/Modals/Modals';

// Feature Components
import { MetricCard } from '../componentsIMC/MetricCard';
import { HistoryTable } from '../componentsIMC/HistoriaTabla';
import { HistoryChart } from '../componentsIMC/TablaHistoria';
import { RegisterMeasurementModal } from '../componentsIMC/RegistrarMedidaModal';
import type { PhysicalRecord, PhysicalEvolution } from '../../../types/types';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import { CardBase } from '../../../components/ui/Cards/CardBase';
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

  return (
    <>
      <Navbar/>
      <Box sx={{ backgroundColor: theme.palette.background.default, py: 4, px: 2, minHeight: 'calc(100vh - 130px)' }}>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Typography
            variant="h1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 800,
              fontSize: '1.75rem',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            {t("pageTitle")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

            <Grid size={{ xs: 12, md: 8 }}>
              <CardBase>
                {isLoading ? (
                  <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    {t("loading")}
                  </Typography>
                ) : (
                  <>
                    <HistoryChart records={records} />
                    <HistoryTable records={records} />
                  </>
                )}
              </CardBase>
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