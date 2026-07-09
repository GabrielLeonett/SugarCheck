import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
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

// Mock inicial basado exactamente en la data visual de tu imagen
const INITIAL_RECORDS: PhysicalRecord[] = [
  { id: '1', fecha: '25/05/2026', peso: 54.2, estatura: 158, imc: 21.7, estado: 'Normal' },
  { id: '2', fecha: '12/04/2026', peso: 63.5, estatura: 158, imc: 25.4, estado: 'Sobrepeso' },
  { id: '3', fecha: '02/03/2026', peso: 65.0, estatura: 157, imc: 26.4, estado: 'Sobrepeso' },
];

const INITIAL_EVOLUTION: PhysicalEvolution = {
  pesoDiff: -1.3,
  estaturaDiff: 2.5,
  fechaReferencia: '12/04/2026',
};

export const PhysicalMonitoringPage: React.FC = () => {
  const { t } = useLanguage("monitoreoFisico");
  const [records, setRecords] = useState<PhysicalRecord[]>(INITIAL_RECORDS);
  const [evolution] = useState<PhysicalEvolution>(INITIAL_EVOLUTION);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveMeasurement = (newData: { peso: number; estatura: number; fecha: string }) => {
    // Cálculo automatizado del IMC: peso / (estatura en metros)^2
    const estaturaMetros = newData.estatura / 100;
    const calculatedImc = newData.peso / (estaturaMetros * estaturaMetros);
    
    let estado: 'Bajo peso' | 'Normal' | 'Sobrepeso' = 'Normal';
    if (calculatedImc < 18.5) estado = 'Bajo peso';
    else if (calculatedImc >= 25) estado = 'Sobrepeso';

    const newRecord: PhysicalRecord = {
      id: String(records.length + 1),
      fecha: newData.fecha,
      peso: newData.peso,
      estatura: newData.estatura,
      imc: calculatedImc,
      estado,
    };

    // Insertar al inicio de la bitácora
    setRecords([newRecord, ...records]);
  };

  const currentImc = records[0]?.imc || 0;

  return (
    <Box
      sx={{
        backgroundColor: '#EBF2F7', // Color exacto de fondo suave de SugarCheck
        minHeight: '100vh',
        padding: '40px 24px',
      }}
    >
      <Navbar/>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Typography
          variant="h1"
          sx={{
            color: '#1C2833',
            fontWeight: 800,
            fontSize: '1.75rem',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          {t("pageTitle")}
        </Typography>

        <Grid container spacing={4}>
          {/* COLUMNA IZQUIERDA (Estrecha: Métmeras y acciones) */}
          <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ButtonBase 
              startIcon={<AddIcon />} 
              onClick={handleOpenModal}
              fullWidth
            >
              {t("registerButton")}
            </ButtonBase>
            
            <MetricCard type="balance" currentImc={currentImc} />
            
            <MetricCard type="evolution" evolutionData={evolution} />
          </Grid>

          {/* COLUMNA DERECHA (Ancha: Gráfico e Historial) */}
          <Grid >
            <CardBase>
              <HistoryChart records={records} />
              <HistoryTable records={records} />
            </CardBase>
          </Grid>
        </Grid>
      </Box>

      {/* MODAL DE REGISTRO */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <RegisterMeasurementModal onClose={handleCloseModal} onSave={handleSaveMeasurement} />
      </Modal>
      <Footer/>
    </Box>
  );
};