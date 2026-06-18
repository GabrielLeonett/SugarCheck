import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Grid, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';

interface RegisterMeasurementModalProps {
  onClose: () => void;
  onSave: (data: { peso: number; estatura: number; fecha: string }) => void;
}

const ModalTitle = styled(Typography)(() => ({
  color: '#2C3E50',
  fontWeight: 700,
  fontSize: '1.25rem',
  textAlign: 'center',
  marginBottom: '24px',
}));

const FormLabel = styled(Typography)(() => ({
  color: '#7F8C8D',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: '6px',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    '& fieldset': { border: '1px solid #D5DBDB' },
    '&:hover fieldset': { borderColor: '#BDC3C7' },
    '&.Mui-focused fieldset': { borderColor: '#5D9CEC' },
  },
}));

export const RegisterMeasurementModal: React.FC<RegisterMeasurementModalProps> = ({ onClose, onSave }) => {
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [aaaa, setAaaa] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peso || !estatura || !dd || !mm || !aaaa) return;

    onSave({
      peso: parseFloat(peso),
      estatura: parseFloat(estatura),
      fecha: `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${aaaa}`,
    });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
      <ModalTitle>Registrar Nuevas Medidas</ModalTitle>

      {/* Input Peso */}
      <Box sx={{ mb: 2.5 }}>
        <FormLabel>Peso</FormLabel>
        <StyledTextField
          fullWidth
          size="small"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end" sx={{ fontWeight: 700, color: '#2C3E50' }}>Kg</InputAdornment>,
            },
          }}
        />
      </Box>

      {/* Input Talla */}
      <Box sx={{ mb: 5 }}>
        <FormLabel>Talla</FormLabel>
        <StyledTextField
          fullWidth
          size="small"
          value={estatura}
          onChange={(e) => setEstatura(e.target.value)}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end" sx={{ fontWeight: 700, color: '#2C3E50' }}>cm</InputAdornment>,
            },
          }}
        />
      </Box>

      {/* Input Fecha Compuesta */}
      <Box sx={{ mb: 4 }}>
        <FormLabel>Fecha</FormLabel>
        <Grid container spacing={1.5}>
          <Grid size={3.5}>
            <StyledTextField placeholder="DD" size="small" value={dd} onChange={(e) => setDd(e.target.value)} />
          </Grid>
          <Grid size={3.5}>
            <StyledTextField placeholder="MM" size="small" value={mm} onChange={(e) => setMm(e.target.value)} />
          </Grid>
          <Grid size={5}>
            <StyledTextField placeholder="YYYY" size="small" value={aaaa} onChange={(e) => setAaaa(e.target.value)} />
          </Grid>
        </Grid>
      </Box>

      {/* Botón de Guardado */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ButtonBase type="submit" startIcon={<CheckIcon />}>
          Registrar Medidas
        </ButtonBase>
      </Box>
    </Box>
  );
};