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
  Button 
} from '@mui/material';

interface ModalGlucosaFormProps {
  open: boolean;
  onClose: () => void;
  nivelGlucosa: string;
  onNivelGlucosaChange: (val: string) => void;
  contexto: string;
  onContextoChange: (val: string) => void;
  fecha: string;
  onFechaChange: (val: string) => void;
  hora: string;
  onHoraChange: (val: string) => void;
  onSave: () => void;
}

export default function ModalGlucosaForm({
  open,
  onClose,
  nivelGlucosa,
  onNivelGlucosaChange,
  contexto,
  onContextoChange,
  fecha,
  onFechaChange,
  hora,
  onHoraChange,
  onSave
}: ModalGlucosaFormProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-glucose-title">
      <Box sx={{ 
        display: "flex", flexDirection: "column", alignItems: "stretch", 
        position: 'absolute', top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)', width: 450, 
        bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 
      }}>
        <Typography id="modal-glucose-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          Registrar Nueva Medición
        </Typography>

        <TextField 
          fullWidth 
          margin="normal" 
          id="glucose-level" 
          label="Nivel de Glucosa (mg/dL)" 
          type="number" 
          value={nivelGlucosa}
          onChange={(e) => onNivelGlucosaChange(e.target.value)}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="contexto-medicion-label">Contexto de la Medición</InputLabel>
          <Select
            labelId="contexto-medicion-label"
            value={contexto}
            label="Contexto de la Medición"
            onChange={(e) => onContextoChange(e.target.value)}
          >
            <MenuItem value="Ayunas">En Ayunas</MenuItem>
            <MenuItem value="Después de Comer">Después de Comer</MenuItem>
            <MenuItem value="Control General">Control General</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 7 }}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={fecha}
              onChange={(e) => onFechaChange(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 5 }}>
            <TextField
              fullWidth
              label="Hora"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              value={hora}
              onChange={(e) => onHoraChange(e.target.value)}
            />
          </Grid>
        </Grid>

        <Button onClick={onSave} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
          Guardar Medición
        </Button>
      </Box>
    </Modal>
  );
}