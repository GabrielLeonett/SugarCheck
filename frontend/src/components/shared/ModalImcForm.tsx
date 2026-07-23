import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useLanguage from '../../hooks/useLanguage';
import { useEffect } from 'react';

const imcSchema = z.object({
  peso: z.string()
    .min(1, 'El peso es obligatorio')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 700, 'Ingresa un peso válido (kg)'),
  altura: z.string()
    .min(1, 'La talla es obligatoria')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 280, 'Ingresa una talla válida (cm)'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
});

type ImcFormData = z.infer<typeof imcSchema>;

interface ModalImcFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { peso: number; altura: number; fecha: string }) => void;
}

const obtenerFechaActual = () => {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
  return fechaLocal.toISOString().split('T')[0];
};

export default function ModalImcForm({ open, onClose, onSave }: ModalImcFormProps) {
  const { t } = useLanguage('monitoreoFisico');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ImcFormData>({
    resolver: zodResolver(imcSchema),
    mode: 'onChange',
    defaultValues: { peso: '', altura: '', fecha: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ peso: '', altura: '', fecha: obtenerFechaActual() });
    }
  }, [open, reset]);

  const onSubmit = (data: ImcFormData) => {
    onSave({ peso: Number(data.peso), altura: Number(data.altura), fecha: data.fecha });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-imc-title">
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
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="modal-imc-title"
          variant="h6"
          component="h2"
          color="primary.dark"
          sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}
        >
          {t('modalTitle')}
        </Typography>

        <TextField
          {...register('peso')}
          fullWidth
          margin="normal"
          label={t('weightLabel')}
          type="number"
          slotProps={{ input: { endAdornment: <span>Kg</span> } }}
          error={!!errors.peso}
          helperText={errors.peso?.message}
        />

        <TextField
          {...register('altura')}
          fullWidth
          margin="normal"
          label={t('heightLabel')}
          type="number"
          slotProps={{ input: { endAdornment: <span>cm</span> } }}
          error={!!errors.altura}
          helperText={errors.altura?.message}
        />

        <TextField
          {...register('fecha')}
          fullWidth
          margin="normal"
          label={t('dateLabel')}
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.fecha}
          helperText={errors.fecha?.message}
        />

        <Button
          type="submit"
          sx={{ mt: 3, py: 1 }}
          variant="contained"
          color="primary"
          fullWidth
        >
          {t('saveButton')}
        </Button>
      </Box>
    </Modal>
  );
}
