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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insulinaRapidaSchema, type InsulinaRapidaData, type ZonaBackend } from '../../../schemas/insulina';
import type { InsulinRecord } from '../../../apis/insulina';
import useLanguage from '../../../hooks/useLanguage';
import { useUiStore } from '../../../stores/uiStore';
import { useEffect, useState } from 'react';
import ZonaSelector from './ZonaSelector';

interface ModalInsulinaRapidaProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    dosis: number;
    contexto: string;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
  }) => Promise<void>;
  record?: InsulinRecord | null;
  title?: string;
  submitLabel?: string;
}

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

export default function ModalInsulinaRapida({
  open,
  onClose,
  onSave,
  record,
  title,
  submitLabel,
}: ModalInsulinaRapidaProps) {
  const { t } = useLanguage('insulina');
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InsulinaRapidaData>({
    resolver: zodResolver(insulinaRapidaSchema),
    mode: 'onChange',
    defaultValues: {
      dosis: 0,
      contexto: '',
      fecha: obtenerFechaActual(),
      hora: obtenerHoraActual(),
      zona: 'ABDOMEN_IZQUIERDO' as ZonaBackend,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        record
          ? {
              dosis: record.dosis,
              contexto: record.contexto ?? '',
              fecha: record.fecha.split('T')[0],
              hora: record.hora,
              zona: (record.zona as ZonaBackend) || 'ABDOMEN_IZQUIERDO',
            }
          : {
              dosis: 0,
              contexto: '',
              fecha: obtenerFechaActual(),
              hora: obtenerHoraActual(),
              zona: 'ABDOMEN_IZQUIERDO' as ZonaBackend,
            }
      );
    }
  }, [open, reset, record]);

  const dosisActual = watch('dosis');
  const setDosis = (valor: number) =>
    setValue('dosis', valor, { shouldValidate: true });

  const onSubmit = async (data: InsulinaRapidaData) => {
    setLoading(true);
    try {
      const parts = data.fecha.split('-');
      await onSave({
        dosis: data.dosis,
        contexto: data.contexto,
        dia: parseInt(parts[2], 10),
        mes: parseInt(parts[1], 10),
        anio: parseInt(parts[0], 10),
        hora: data.hora,
        zona: data.zona,
      });
      onClose();
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : t('errorGuardarRegistro')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-insulina-rapida-title">
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
          maxWidth: '95vw',
          maxHeight: '94vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="modal-insulina-rapida-title"
          variant="h6"
          component="h2"
          color="primary.dark"
          sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}
        >
          {title ?? t('modalRapidaTitle')}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
            {t('dosis')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <IconButton
              type="button"
              onClick={() => setDosis(Math.max(0, dosisActual - 1))}
              color="primary"
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              value={dosisActual === 0 ? '' : dosisActual}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDosis(isNaN(val) ? 0 : val);
              }}
              type="number"
              error={!!errors.dosis}
              helperText={errors.dosis?.message}
              slotProps={{ htmlInput: { step: 1 } }}
              sx={{ width: 140, '& input': { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' } }}
            />
            <IconButton type="button" onClick={() => setDosis(dosisActual + 1)} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <FormControl fullWidth margin="normal" error={!!errors.contexto}>
          <InputLabel id="contexto-insulina-label">
            {t('applicationContext')}
          </InputLabel>
          <Select
            labelId="contexto-insulina-label"
            label={t('applicationContext')}
            {...register('contexto')}
          >
            <MenuItem value="DESAYUNO">{t('beforeBreakfast')}</MenuItem>
            <MenuItem value="ALMUERZO">{t('beforeLunch')}</MenuItem>
            <MenuItem value="CENA">{t('beforeDinner')}</MenuItem>
            <MenuItem value="CORRECCION">{t('correction')}</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 7 }}>
            <TextField
              {...register('fecha')}
              fullWidth
              label={t('date')}
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
              label={t('time')}
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.hora}
              helperText={errors.hora?.message}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <ZonaSelector
            value={(watch('zona') as ZonaBackend) || ''}
            onChange={(zona) => setValue('zona', zona, { shouldValidate: true })}
            error={!!errors.zona}
          />
        </Box>

        <Button
          type="submit"
          sx={{ mt: 3, py: 1 }}
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {submitLabel ?? (loading ? t('saving') : t('saveMeasurement'))}
        </Button>
      </Box>
    </Modal>
  );
}