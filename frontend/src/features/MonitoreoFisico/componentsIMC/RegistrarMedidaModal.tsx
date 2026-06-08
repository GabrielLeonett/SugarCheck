import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Grid, styled } from '@mui/material';
import { Button } from '../../../components/ui/Button/Button';
import CheckIcon from '@mui/icons-material/Check';

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
    <Box component="form" onSubmit={handleSubmit} p={1}>
      <ModalTitle>Registrar Nuevas Medidas</ModalTitle>

      {/* Input Peso */}
      <Box mb={2.5}>
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
      <Box mb={2.5}>
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
      <Box mb={4}>
        <FormLabel>Fecha</FormLabel>
        <Grid container spacing={1.5}>
          <Grid item xs={3.5}>
            <StyledTextField placeholder="DD" size="small" value={dd} onChange={(e) => setDd(e.target.value)} inputProps={{ maxLength: 2, style: { textAlign: 'center' } }} />
          </Grid>
          <Grid item xs={3.5}>
            <StyledTextField placeholder="MM" size="small" value={mm} onChange={(e) => setMm(e.target.value)} inputProps={{ maxLength: 2, style: { textAlign: 'center' } }} />
          </Grid>
          <Grid item xs={5}>
            <StyledTextField placeholder="YYYY" size="small" value={aaaa} onChange={(e) => setAaaa(e.target.value)} inputProps={{ maxLength: 4, style: { textAlign: 'center' } }} />
          </Grid>
        </Grid>
      </Box>

      {/* Botón de Guardado */}
      <Box display="flex" justifyContent="center">
        <Button variant="primary" type="submit" startIcon={<CheckIcon />}>
          Registrar Medidas
        </Button>
      </Box>
    </Box>
  );
};