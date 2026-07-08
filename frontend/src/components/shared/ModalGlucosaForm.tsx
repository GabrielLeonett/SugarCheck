import {
  Modal,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { glucosaSchema, type GlucosaData } from '../../schemas/glucosa';
import useLanguage from '../../hooks/useLanguage';
import { useEffect } from 'react';

interface ModalGlucosaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GlucosaData) => void;
}

export default function ModalGlucosaForm({
  open,
  onClose,
  onSave,
}: ModalGlucosaFormProps) {
  const { t } = useLanguage('glucemia');

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
    return fechaLocal.toISOString().split('T')[0];
  };

  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GlucosaData>({
    resolver: zodResolver(glucosaSchema),
    mode: 'onChange',
    defaultValues: {
      nivelGlucosa: '',
      contexto: '',
      fecha: '',
      hora: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nivelGlucosa: '',
        contexto: '',
        fecha: obtenerFechaActual(),
        hora: obtenerHoraActual(),
      });
    }
  }, [open, reset]);

  const onSubmit = (data: GlucosaData) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-glucose-title">
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="modal-glucose-title"
          variant="h6"
          component="h2"
          color="primary.dark"
          sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}
        >
          {t('modal.title')}
        </Typography>

        <TextField
          {...register('nivelGlucosa')}
          fullWidth
          margin="normal"
          id="glucose-level"
          label={t('modal.labelNivel')}
          type="number"
          error={!!errors.nivelGlucosa}
          helperText={errors.nivelGlucosa?.message}
        />

        <FormControl fullWidth margin="normal" error={!!errors.contexto}>
          <InputLabel id="contexto-medicion-label">
            {t('modal.labelContexto')}
          </InputLabel>
          <Select
            labelId="contexto-medicion-label"
            label={t('modal.labelContexto')}
            {...register('contexto')}
          >
            <MenuItem value="Ayunas">
              {t('modal.contextos.ayunas')}
            </MenuItem>
            <MenuItem value="Después de Comer">
              {t('modal.contextos.despuesComer')}
            </MenuItem>
            <MenuItem value="Control General">
              {t('modal.contextos.controlGeneral')}
            </MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 7 }}>
            <TextField
              {...register('fecha')}
              fullWidth
              label={t('modal.labelFecha')}
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.fecha}
              helperText={errors.fecha?.message}
            />
          </Grid>
          <Grid size={{ xs: 5 }}>
            <TextField
              {...register('hora')}
              fullWidth
              label={t('modal.labelHora')}
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.hora}
              helperText={errors.hora?.message}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          sx={{ mt: 3, py: 1 }}
          variant="contained"
          color="primary"
          fullWidth
        >
          {t('modal.btnGuardar')}
        </Button>
      </Box>
    </Modal>
  );
}
