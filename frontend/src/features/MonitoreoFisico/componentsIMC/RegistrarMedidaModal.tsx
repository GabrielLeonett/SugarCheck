import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment,
  useTheme 
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import useLanguage from "../../../hooks/useLanguage";

interface RegisterMeasurementModalProps {
  onClose: () => void;
  onSave: (data: { peso: number; estatura: number; fecha: string }) => void;
}

export const RegisterMeasurementModal: React.FC<RegisterMeasurementModalProps> = ({ onClose, onSave }) => {
  const { t } = useLanguage("monitoreoFisico");
  const theme = useTheme();
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [fecha, setFecha] = useState(''); 

  const handleSave = () => {
    if (peso && talla && fecha) {
      onSave({
        peso: parseFloat(peso),
        estatura: parseFloat(talla),
        fecha: fecha,
      });
      onClose();
      setPeso('');
      setTalla('');
      setFecha('');
    }
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: theme.palette.background.default, borderRadius: '12px', minWidth: '350px' }}>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        {t("modalTitle")}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label={t("weightLabel")}
          variant="outlined"
          fullWidth
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          type="number"
          sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }}
          slotProps={{ input: {
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
          }}}
        />

        <TextField
          label={t("heightLabel")}
          variant="outlined"
          fullWidth
          value={talla}
          onChange={(e) => setTalla(e.target.value)}
          type="number"
          sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }}
          slotProps={{ input: {
            endAdornment: <InputAdornment position="end">cm</InputAdornment>,
          }}}
        />

        <TextField
          label={t("dateLabel")}
          variant="outlined"
          fullWidth
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }}
          placeholder={`${t("dayPlaceholder")}/${t("monthPlaceholder")}/${t("yearPlaceholder")}`}
        />

        {/* Usamos tu ButtonBase pasándole estilos específicos (sx) para este caso */}
        <ButtonBase
          onClick={handleSave}
          startIcon={<CheckIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#FFFFFF',
            mt: 2,
            py: 1.5,
            width: '100%',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          {t("saveButton")}
        </ButtonBase>
      </Box>
    </Box>
  );
};
