import { Box, Divider } from '@mui/material';
import Navbar from '../../components/layout/Header/Navbar.tsx';
import Footer from '../../components/layout/Footer/Footer.tsx';

// Hook de datos unificado
import { useGlucosaData } from '../../hooks/useGlucosaData.tsx';

// Componentes locales del feature recién creados
import { SeccionGlucemia } from './componentsGlucosa/SeccionGlucemia';
import { SeccionHbA1c } from './componentsGlucosa/SeccionHbA1c';

export default function Glucosa() {
  const glucoseHookData = useGlucosaData();

  // Acciones de envío que coordinan el guardado
  const handleSaveGlucosa = () => {
    console.log("Guardando glucosa:", { 
      nivel: glucoseHookData.nivelGlucosaInput, 
      contexto: glucoseHookData.contexto, 
      fecha: glucoseHookData.fechaGlucosa, 
      hora: glucoseHookData.hora 
    });
    glucoseHookData.handleCloseGlucosa();
  };

  const handleSaveHbA1c = () => {
    console.log("Guardando HbA1c:", { 
      resultado: glucoseHookData.resultadoHbA1cInput, 
      fecha: glucoseHookData.fechaHbA1c 
    });
    glucoseHookData.handleCloseHbA1c();
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mx: 7, my: 10 }}>
        
        {/* SUB-MÓDULO 1: GLUCEMIA */}
        <SeccionGlucemia 
          dataHook={glucoseHookData} 
          onSaveGlucosa={handleSaveGlucosa} 
        />

        <Divider sx={{ marginY: 8, borderColor: "primary.light" }} />

        {/* SUB-MÓDULO 2: HEMOGLOBINA GLICOSILADA */}
        <SeccionHbA1c 
          dataHook={glucoseHookData} 
          onSaveHbA1c={handleSaveHbA1c} 
        />

      </Box>
      <Footer />
    </>
  );
}