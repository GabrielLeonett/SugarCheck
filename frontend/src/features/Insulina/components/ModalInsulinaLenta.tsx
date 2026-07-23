import { Typography, Box, Grid, TextField, IconButton, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
import { ButtonBase } from "../../../components/ui/Buttons/ButtonBase.tsx";
import { Modal } from "../../../components/ui/Modals/Modals.tsx";
import useLanguage from "../../../hooks/useLanguage";

interface ModalInsulinaLentaProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    dosis: number;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
  }) => Promise<void>;
}

const obtenerFechaActual = () => {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
  return fechaLocal.toISOString().split('T')[0];
};

const obtenerHoraActual = () => {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
};

export default function ModalInsulinaLenta({ open, onClose, onSave }: ModalInsulinaLentaProps) {
  const { t } = useLanguage("insulina");
  const [dosis, setDosis] = useState<number>(0);
  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [hora, setHora] = useState(obtenerHoraActual());
  const [loading, setLoading] = useState(false);

  const [vistaCuerpo, setVistaCuerpo] = useState<"FRENTE" | "ATRÁS">("FRENTE");
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>(t("zoneAbdomenLeft"));

  const zonasFrente = [
    t("zoneAbdomenRight"),
    t("zoneAbdomenLeft"),
    t("zoneThighRight"),
    t("zoneThighLeft"),
  ];
  
  const zonasAtras = [
    t("zoneArmRight"),
    t("zoneArmLeft"),
    t("zoneGluteRight"),
    t("zoneGluteLeft"),
  ];

  const zonasActuales = vistaCuerpo === "FRENTE" ? zonasFrente : zonasAtras;

  const getZonaColor = (zona: string, esSeleccionado: boolean) => {
    if (!esSeleccionado) return "#e2e8f0";
    if (zona.includes("Abdomen")) return "#ef4444";
    if (zona.includes("Glúteo")) return "#22c55e";
    if (zona.includes("Muslo")) return "#f59e0b";
    if (zona.includes("Brazo")) return "#f97316";
    return "#64748b";
  };

  useEffect(() => {
    if (open) {
      setDosis(0);
      setFecha(obtenerFechaActual());
      setHora(obtenerHoraActual());
      setZonaSeleccionada(t("zoneAbdomenLeft"));
    }
  }, [open, t]);

  const zonaToBackend = (zona: string): string => {
    const mapping: Record<string, string> = {
      [t("zoneAbdomenRight")]: 'ABDOMEN_DERECHO',
      [t("zoneAbdomenLeft")]: 'ABDOMEN_IZQUIERDO',
      [t("zoneThighRight")]: 'MUSLO_DERECHO',
      [t("zoneThighLeft")]: 'MUSLO_IZQUIERDO',
      [t("zoneArmRight")]: 'BRAZO_DERECHO',
      [t("zoneArmLeft")]: 'BRAZO_IZQUIERDO',
      [t("zoneGluteRight")]: 'GLUTEO_DERECHO',
      [t("zoneGluteLeft")]: 'GLUTEO_IZQUIERDO',
    };
    return mapping[zona] || 'ABDOMEN_IZQUIERDO';
  };

  const handleGuardar = async () => {
    if (dosis === 0) {
      alert(t("pleaseEnterUnits"));
      return;
    }
    
    setLoading(true);
    try {
      const parts = fecha.split('-');
      await onSave({
        dosis,
        dia: parseInt(parts[2], 10),
        mes: parseInt(parts[1], 10),
        anio: parseInt(parts[0], 10),
        hora,
        zona: zonaToBackend(zonaSeleccionada),
      });
      onClose();
    } catch {
      alert("Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 0, maxWidth: 900, mx: "auto" }}>
        <Box sx={{ bgcolor: "#f8fafc", p: 3, borderBottom: "1px solid #e2e8f0", borderRadius: "12px 12px 0 0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e293b" }}>
              {t("modalLentaTitle")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Dosis */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#475569", mb: 1 }}>
                  {t("dosis")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <IconButton
                    onClick={() => setDosis((prev) => Math.max(0, prev - 1))}
                    sx={{ bgcolor: "#e2e8f0", color: "#475569", "&:hover": { bgcolor: "#cbd5e1" }, borderRadius: 2, width: 40, height: 40 }}>
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={dosis === 0 ? "" : dosis}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDosis(isNaN(val) ? 0 : val);
                    }}
                    type="number"
                    slotProps={{ htmlInput: { step: 1 } }}
                    sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" }, "& input": { textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" } }}
                  />
                  <IconButton
                    onClick={() => setDosis((prev) => prev + 1)}
                    sx={{ bgcolor: "#e2e8f0", color: "#475569", "&:hover": { bgcolor: "#cbd5e1" }, borderRadius: 2, width: 40, height: 40 }}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "#94a3b8", mt: 0.5 }}>
                  {t("measurementContext")}
                </Typography>
              </Box>

              {/* Fecha y Hora */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label={t("date")} type="date" value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label={t("time")} type="time" value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} />
                </Grid>
              </Grid>
            </Grid>

            {/* COLUMNA DERECHA: Mapa Corporal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#475569" }}>
                  {t("applicationZone")}
                </Typography>
                <Box sx={{ display: "inline-flex", borderRadius: 2, bgcolor: "#e2e8f0", p: 0.5 }}>
                  <ButtonBase size="small" onClick={() => setVistaCuerpo("FRENTE")}
                    sx={{ bgcolor: vistaCuerpo === "FRENTE" ? "#1e293b" : "transparent", color: vistaCuerpo === "FRENTE" ? "white" : "#475569", borderRadius: 1, px: 2, py: 0.5, fontSize: "0.75rem" }}>
                    {t("front")}
                  </ButtonBase>
                  <ButtonBase size="small" onClick={() => setVistaCuerpo("ATRÁS")}
                    sx={{ bgcolor: vistaCuerpo === "ATRÁS" ? "#1e293b" : "transparent", color: vistaCuerpo === "ATRÁS" ? "white" : "#475569", borderRadius: 1, px: 2, py: 0.5, fontSize: "0.75rem" }}>
                    {t("back")}
                  </ButtonBase>
                </Box>
              </Box>

              <Grid container spacing={1.5}>
                {zonasActuales.map((zona) => {
                  const esSeleccionado = zonaSeleccionada === zona;
                  const color = getZonaColor(zona, esSeleccionado);
                  return (
                    <Grid size={{ xs: 6 }} key={zona}>
                      <Paper onClick={() => setZonaSeleccionada(zona)}
                        elevation={esSeleccionado ? 3 : 1}
                        sx={{ p: 1.5, textAlign: "center", borderRadius: 2, cursor: "pointer", transition: "all 0.2s",
                          bgcolor: esSeleccionado ? color : "white", color: esSeleccionado ? "white" : "#475569",
                          border: esSeleccionado ? "2px solid" : "1px solid #e2e8f0", borderColor: esSeleccionado ? color : "#e2e8f0",
                          "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                        }}>
                        <Typography variant="body2" sx={{ fontWeight: esSeleccionado ? "bold" : "normal", fontSize: "0.8rem" }}>
                          {zona}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 3 }}>
                <ButtonBase variant="contained" fullWidth startIcon={<CheckCircleIcon />}
                  onClick={handleGuardar} disabled={loading}
                  sx={{ bgcolor: "#1e293b", "&:hover": { bgcolor: "#0f172a" }, py: 1.5, borderRadius: 2 }}>
                  {loading ? "Guardando..." : t("saveMeasurement")}
                </ButtonBase>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}
