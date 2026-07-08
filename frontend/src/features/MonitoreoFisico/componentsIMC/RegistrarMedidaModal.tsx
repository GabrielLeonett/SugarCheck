import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment 
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

// Importamos TU componente base
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import { monitoreoFisicoSchema, type MonitoreoFisicoData } from '../../../schemas/monitoreo_fisico';

interface RegisterMeasurementModalProps {
  onClose: () => void;
  onSave: (data: { peso: number; estatura: number; fecha: string }) => void;
}

export const RegisterMeasurementModal: React.FC<RegisterMeasurementModalProps> = ({ onClose, onSave }) => {
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
    <Box sx={{ padding: '24px', backgroundColor: '#EBF2F7', borderRadius: '12px', minWidth: '350px' }}>
      <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        Registrar Nuevas Medidas
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Peso"
          variant="outlined"
          fullWidth
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          type="number"
          sx={{ backgroundColor: '#FFFFFF', borderRadius: '4px' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
          }}
        />

        <TextField
          label="Talla"
          variant="outlined"
          fullWidth
          value={talla}
          onChange={(e) => setTalla(e.target.value)}
          type="number"
          sx={{ backgroundColor: '#FFFFFF', borderRadius: '4px' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">cm</InputAdornment>,
          }}
        />

        <TextField
          label="Fecha (DD/MM/YYYY)"
          variant="outlined"
          fullWidth
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          sx={{ backgroundColor: '#FFFFFF', borderRadius: '4px' }}
          placeholder="25/05/2026"
        />

        {/* Usamos tu ButtonBase pasándole estilos específicos (sx) para este caso */}
        <ButtonBase
          onClick={handleSave}
          startIcon={<CheckIcon />}
          sx={{
            backgroundColor: '#7FB3D5', // Ajuste al color celeste del diseño
            color: '#FFFFFF',
            mt: 2,
            py: 1.5,
            width: '100%',
            '&:hover': {
              backgroundColor: '#5C97BF',
            }
          }}
        >
          Registrar Medidas
        </ButtonBase>
      </Box>
    </Box>
  );
};
