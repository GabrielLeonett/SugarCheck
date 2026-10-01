import { Modal, Typography, Box, TextField, IconButton, Paper, Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
import { preferenceApi } from "../../../apis/preference_config";
import type { CorrectionSchemaItem } from "../../../schemas/preference_config";

interface ModalDynamicCorrectionProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalDynamicCorrection({ open, onClose }: ModalDynamicCorrectionProps) {
  const theme = useTheme();
  const [items, setItems] = useState<CorrectionSchemaItem[]>([]);
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [dose, setDose] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      preferenceApi.getPreferences().then((prefs) => {
        setItems(prefs.correctionSchemas ?? []);
      }).catch(() => {});
      setRangeMin("");
      setRangeMax("");
      setDose("");
      setEditingIndex(null);
    }
  }, [open]);

  const handleAdd = () => {
    const min = parseFloat(rangeMin);
    const max = parseFloat(rangeMax);
    const d = parseFloat(dose);
    if (isNaN(min) || isNaN(max) || isNaN(d) || min < 0 || max <= 0 || d <= 0 || min >= max) return;

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = { rangeMin: min, rangeMax: max, dose: d };
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems([...items, { rangeMin: min, rangeMax: max, dose: d }]);
    }
    setRangeMin("");
    setRangeMax("");
    setDose("");
  };

  const handleEdit = (index: number) => {
    const item = items[index];
    setRangeMin(String(item.rangeMin));
    setRangeMax(String(item.rangeMax));
    setDose(String(item.dose));
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setRangeMin("");
      setRangeMax("");
      setDose("");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const current = await preferenceApi.getPreferences();
      await preferenceApi.savePreferences({
        ...current,
        correctionSchemas: items,
      });
      onClose();
    } catch {
      alert("Error al guardar los rangos de corrección");
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
            Corrección Dinámica
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <TextField label="Mín (mg/dL)" value={rangeMin} onChange={(e) => setRangeMin(e.target.value)} type="number" size="small" sx={{ flex: 1, minWidth: 100 }} />
            <TextField label="Máx (mg/dL)" value={rangeMax} onChange={(e) => setRangeMax(e.target.value)} type="number" size="small" sx={{ flex: 1, minWidth: 100 }} />
            <TextField label="Dosis (UI)" value={dose} onChange={(e) => setDose(e.target.value)} type="number" size="small" sx={{ flex: 1, minWidth: 80 }} />
            <IconButton onClick={handleAdd} color="primary" sx={{ alignSelf: "center" }}>
              {editingIndex !== null ? <EditIcon /> : <AddIcon />}
            </IconButton>
          </Box>

          {items.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: "center", color: theme.palette.text.disabled, my: 2 }}>
              No hay rangos definidos. Agregue uno arriba.
            </Typography>
          )}

          {items.map((item, index) => (
            <Paper key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, mb: 1, borderRadius: 2 }}>
              <Typography variant="body2">
                {item.rangeMin} - {item.rangeMax} mg/dL → <strong>{item.dose} UI</strong>
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
            {loading ? "Guardando..." : "Guardar rangos de corrección"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
