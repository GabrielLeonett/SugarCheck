import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hba1cSchema, type HbA1cData } from '../../schemas/hba1c';
import { useEffect } from 'react';
import useLanguage from "../../hooks/useLanguage";

interface ModalHbA1cFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: HbA1cData) => void;
}

export default function ModalHbA1cForm({
  open,
  onClose,
  onSave,
}: ModalHbA1cFormProps) {
  const { t } = useLanguage("hba1c");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HbA1cData>({
    resolver: zodResolver(hba1cSchema),
    mode: 'onChange',
    defaultValues: {
      resultadoHbA1c: '',
      fecha: '',
    },
  });

  useEffect(() => {
    if (open) {
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset();
      const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
      reset({
        resultadoHbA1c: '',
        fecha: fechaLocal.toISOString().split('T')[0],
      });
    }
  }, [open, reset]);

  const onSubmit = (data: HbA1cData) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-hba1c-title">
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
          id="modal-hba1c-title"
          variant="h6"
          component="h2"
          color="primary.dark"
          sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}
        >
          {t("modalTitle")}
        </Typography>

        <TextField
          {...register('resultadoHbA1c')}
          fullWidth
          margin="normal"
          id="hba1c-level"
          label={t("resultLabel")}
          type="number"
          error={!!errors.resultadoHbA1c}
          helperText={errors.resultadoHbA1c?.message}
        />

        <TextField
          {...register('fecha')}
          fullWidth
          margin="normal"
          label={t("dateLabel")}
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
          {t("saveButton")}
        </Button>
      </Box>
    </Modal>
  );
}
