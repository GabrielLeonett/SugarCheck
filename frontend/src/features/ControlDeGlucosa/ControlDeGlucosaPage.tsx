import { Box, Divider } from '@mui/material';
import Navbar from '../../components/layout/Header/Navbar.tsx';
import Footer from '../../components/layout/Footer/Footer.tsx';
import { useGlucosaData } from '../../hooks/useGlucosaData.tsx';
import { SeccionGlucemia } from './componentsGlucosa/SeccionGlucemia';
import { SeccionHbA1c } from './componentsGlucosa/SeccionHbA1c';
import type { GlucosaData } from '../../schemas/glucosa';
import type { HbA1cData } from '../../schemas/hba1c';

export default function Glucosa() {
  const glucoseHookData = useGlucosaData();

  const handleSaveGlucosa = (data: GlucosaData) => {
    console.log("Guardando glucosa:", data);
    glucoseHookData.handleCloseGlucosa();
  };

  const handleSaveHbA1c = (data: HbA1cData) => {
    console.log("Guardando HbA1c:", data);
    glucoseHookData.handleCloseHbA1c();
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 } }}>
        
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