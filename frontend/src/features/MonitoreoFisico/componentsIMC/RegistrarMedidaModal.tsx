import { Box, Typography, TextField, InputAdornment, Grid, styled } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CheckIcon from '@mui/icons-material/Check';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import { monitoreoFisicoSchema, type MonitoreoFisicoData } from '../../../schemas/monitoreo_fisico';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MonitoreoFisicoData>({
    resolver: zodResolver(monitoreoFisicoSchema),
    mode: 'onChange',
    defaultValues: {
      peso: '',
      estatura: '',
      dd: '',
      mm: '',
      aaaa: '',
    },
  });

  const onSubmit = (data: MonitoreoFisicoData) => {
    onSave({
      peso: parseFloat(data.peso),
      estatura: parseFloat(data.estatura),
      fecha: `${data.dd.padStart(2, '0')}/${data.mm.padStart(2, '0')}/${data.aaaa}`,
    });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <ModalTitle>Registrar Nuevas Medidas</ModalTitle>

      <Box sx={{ mb: 2.5 }}>
        <FormLabel>Peso</FormLabel>
        <StyledTextField
          fullWidth
          size="small"
          {...register('peso')}
          error={!!errors.peso}
          helperText={errors.peso?.message}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end" sx={{ fontWeight: 700, color: '#2C3E50' }}>Kg</InputAdornment>,
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 5 }}>
        <FormLabel>Talla</FormLabel>
        <StyledTextField
          fullWidth
          size="small"
          {...register('estatura')}
          error={!!errors.estatura}
          helperText={errors.estatura?.message}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end" sx={{ fontWeight: 700, color: '#2C3E50' }}>cm</InputAdornment>,
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <FormLabel>Fecha</FormLabel>
        <Grid container spacing={1.5}>
          <Grid size={3.5}>
            <StyledTextField
              placeholder="DD"
              size="small"
              {...register('dd')}
              error={!!errors.dd}
              helperText={errors.dd?.message}
            />
          </Grid>
          <Grid size={3.5}>
            <StyledTextField
              placeholder="MM"
              size="small"
              {...register('mm')}
              error={!!errors.mm}
              helperText={errors.mm?.message}
            />
          </Grid>
          <Grid size={5}>
            <StyledTextField
              placeholder="YYYY"
              size="small"
              {...register('aaaa')}
              error={!!errors.aaaa}
              helperText={errors.aaaa?.message}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ButtonBase type="submit" startIcon={<CheckIcon />}>
          Registrar Medidas
        </ButtonBase>
      </Box>
    </Box>
  );
};
