import { Modal, Box, Typography, TextField, Button } from '@mui/material';

interface ModalHbA1cFormProps {
  open: boolean;
  onClose: () => void;
  resultadoHbA1c: string;
  onResultadoHbA1cChange: (val: string) => void;
  fecha: string;
  onFechaChange: (val: string) => void;
  onSave: () => void;
}

export default function ModalHbA1cForm({
  open,
  onClose,
  resultadoHbA1c,
  onResultadoHbA1cChange,
  fecha,
  onFechaChange,
  onSave
}: ModalHbA1cFormProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-hba1c-title">
      <Box sx={{
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
        p: 4
      }}>
        <Typography id="modal-hba1c-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          Registrar Resultado HbA1c
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          id="hba1c-level"
          label="Resultado del Laboratorio (%)"
          type="number"
          value={resultadoHbA1c}
          onChange={(e) => onResultadoHbA1cChange(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Fecha del Análisis"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
        />

        <Button onClick={onSave} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
          Guardar Resultado
        </Button>
      </Box>
    </Modal>
  );
}
