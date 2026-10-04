import {
  Box, Divider, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Navbar from '../../components/layout/Header/Navbar.tsx';
import Footer from '../../components/layout/Footer/Footer.tsx';
import { useGlucosaData } from '../../hooks/useGlucosaData.tsx';
import { SeccionGlucemia } from './componentsGlucosa/SeccionGlucemia';
import { SeccionHbA1c } from './componentsGlucosa/SeccionHbA1c';
import { formToCreateGlucoseDto } from '../../schemas/glucosa';
import { formToCreateHbA1cDto } from '../../schemas/hba1c';
import useLanguage from '../../hooks/useLanguage';
import type { GlucosaData } from '../../schemas/glucosa';
import type { HbA1cData } from '../../schemas/hba1c';

export default function Glucosa() {
  const { t } = useLanguage('glucemia');
  const glucoseHookData = useGlucosaData();

  const handleSaveGlucosa = (data: GlucosaData) => {
    const dto = formToCreateGlucoseDto(data);
    glucoseHookData.handleSaveGlucosa(dto);
  };

  const handleSaveHbA1c = (data: HbA1cData) => {
    const dto = formToCreateHbA1cDto(data);
    glucoseHookData.handleSaveHbA1c(dto);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 }, minHeight: 'calc(100vh - 130px)' }}>
        <Box sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
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
      </Box>

      {/* Crisis Alert Modal */}
      <Dialog
        open={glucoseHookData.isCrisis}
        onClose={glucoseHookData.handleCloseCrisis}
        aria-labelledby="crisis-alert-title"
      >
        <DialogTitle id="crisis-alert-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          {t('frecuenciaAlertas.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {glucoseHookData.crisisValue !== null && glucoseHookData.crisisValue < 70
              ? t('zonaSegura.alertaBaja')
              : t('zonaSegura.alertaAlta')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={glucoseHookData.handleCloseCrisis} variant="contained" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}