import { Modal, Typography, Box, TextField, IconButton, Paper, Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
import { preferenceApi } from "../../../apis/preference_config";
import type { BasalSchemaItem } from "../../../schemas/preference_config";

interface ModalBasalSchemaProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalBasalSchema({ open, onClose }: ModalBasalSchemaProps) {
  const theme = useTheme();
  const [items, setItems] = useState<BasalSchemaItem[]>([]);
  const [injectionTime, setInjectionTime] = useState("");
  const [dose, setDose] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      preferenceApi.getPreferences().then((prefs) => {
        setItems(prefs.basalSchemas ?? []);
      }).catch(() => {});
      setInjectionTime("");
      setDose("");
      setEditingIndex(null);
    }
  }, [open]);

  const handleAdd = () => {
    const d = parseFloat(dose);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(injectionTime) || isNaN(d) || d <= 0) return;

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = { injectionTime, dose: d };
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems([...items, { injectionTime, dose: d }]);
    }
    setInjectionTime("");
    setDose("");
  };

  const handleEdit = (index: number) => {
    const item = items[index];
    setInjectionTime(item.injectionTime);
    setDose(String(item.dose));
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setInjectionTime("");
      setDose("");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const current = await preferenceApi.getPreferences();
      await preferenceApi.savePreferences({
        ...current,
        basalSchemas: items,
      });
      onClose();
    } catch {
      alert("Error al guardar el esquema basal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 500 }, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto',
        bgcolor: theme.palette.background.paper, borderRadius: 3, boxShadow: 24,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>
            Esquema Basal
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <TextField label="Hora" value={injectionTime} onChange={(e) => setInjectionTime(e.target.value)} type="time" size="small" slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1, minWidth: 120 }} />
            <TextField label="Dosis (UI)" value={dose} onChange={(e) => setDose(e.target.value)} type="number" size="small" sx={{ flex: 1, minWidth: 100 }} />
            <IconButton onClick={handleAdd} color="primary" sx={{ alignSelf: "center" }}>
              {editingIndex !== null ? <EditIcon /> : <AddIcon />}
            </IconButton>
          </Box>

          {items.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: "center", color: theme.palette.text.disabled, my: 2 }}>
              No hay esquemas basales definidos. Agregue uno arriba.
            </Typography>
          )}

          {items.map((item, index) => (
            <Paper key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, mb: 1, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>{item.injectionTime}</strong> → {item.dose} UI
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => handleEdit(index)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(index)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Paper>
          ))}

          <Button variant="contained" fullWidth startIcon={<CheckCircleIcon />}
            onClick={handleSave} disabled={loading}
            sx={{ mt: 2, py: 1.5, borderRadius: 2, textTransform: "none" }}>
            {loading ? "Guardando..." : "Guardar esquema basal"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
