import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hba1cSchema, type HbA1cData } from '../../schemas/hba1c';
import type { HbA1cRecord } from '../../data/recordsMock';
import { useEffect, useState } from 'react';
import useLanguage from "../../hooks/useLanguage";

interface ModalHbA1cFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: HbA1cData) => void | Promise<boolean>;
  record?: HbA1cRecord | null;
  title?: string;
  submitLabel?: string;
}

export default function ModalHbA1cForm({
  open,
  onClose,
  onSave,
  record,
  title,
  submitLabel,
}: ModalHbA1cFormProps) {
  const { t } = useLanguage("hba1c");
  const [saving, setSaving] = useState(false);

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
      if (record) {
        reset({
          resultadoHbA1c: String(record.resultado),
          fecha: record.fechaISO.split('T')[0],
        });
        return;
      }
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset();
      const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
      reset({
        resultadoHbA1c: '',
        fecha: fechaLocal.toISOString().split('T')[0],
      });
    }
  }, [open, reset, record]);

  const onSubmit = async (data: HbA1cData) => {
    setSaving(true);
    try {
      const result = await onSave(data);
      if (result !== false) onClose();
    } finally {
      setSaving(false);
    }
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
          {title ?? t("modalTitle")}
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
          disabled={saving}
        >
          {submitLabel ?? t("saveButton")}
        </Button>
      </Box>
    </Modal>
  );
}
