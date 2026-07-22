import { Typography, Box, Grid, TextField, IconButton, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
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

export default function ModalInsulinaLenta({ open, onClose, onSave }: ModalInsulinaLentaProps) {
  const { t } = useLanguage("insulina");
  const [dosis, setDosis] = useState<number>(0);
  const [fecha, setFecha] = useState({ dd: "23", mm: "06", yyyy: "2026" });
  const [hora, setHora] = useState("14:11");
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

  const getZonaIcon = (zona: string) => {
    if (zona.includes("Abdomen")) return "⬤";
    if (zona.includes("Glúteo")) return "⬤";
    if (zona.includes("Muslo")) return "⬤";
    if (zona.includes("Brazo")) return "⬤";
    return "⬤";
  };

  const resetFormulario = () => {
    setDosis(0);
    const now = new Date();
    setFecha({
      dd: String(now.getDate()).padStart(2, '0'),
      mm: String(now.getMonth() + 1).padStart(2, '0'),
      yyyy: String(now.getFullYear()),
    });
    setHora(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setZonaSeleccionada(t("zoneAbdomenLeft"));
  };

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
      await onSave({
        dosis,
        dia: parseInt(fecha.dd, 10),
        mes: parseInt(fecha.mm, 10),
        anio: parseInt(fecha.yyyy, 10),
        hora,
        zona: zonaToBackend(zonaSeleccionada),
      });
      resetFormulario();
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
        {/* Header con título */}
        <Box
          sx={{
            bgcolor: "#f8fafc",
            p: 3,
            borderBottom: "1px solid #e2e8f0",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e293b" }}>
              {t("modalLentaTitle")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* COLUMNA IZQUIERDA: Formulario */}
            <Grid>
              {/* Dosis */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "#475569", mb: 1 }}
                >
                  {t("dosis")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <IconButton
                    onClick={() => setDosis((prev) => Math.max(0, prev - 0.5))}
                    sx={{
                      bgcolor: "#e2e8f0",
                      color: "#475569",
                      "&:hover": { bgcolor: "#cbd5e1" },
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={dosis === 0 ? "" : dosis}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDosis(isNaN(val) ? 0 : val);
                    }}
                    type="number"
                    inputProps={{ step: 0.5 }}
                    sx={{
                      width: 140,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                      },
                      "& input": {
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => setDosis((prev) => prev + 0.5)}
                    sx={{
                      bgcolor: "#e2e8f0",
                      color: "#475569",
                      "&:hover": { bgcolor: "#cbd5e1" },
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "center", color: "#94a3b8", mt: 0.5 }}
                >
                  {t("measurementContext")}
                </Typography>
              </Box>

              {/* Fecha y Hora */}
              <Grid container spacing={2}>
                <Grid>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
                  >
                    {t("date")}
                  </Typography>
                  <TextField
                    placeholder="DD/MM/YYYY"
                    size="small"
                    value={`${fecha.dd}/${fecha.mm}/${fecha.yyyy}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 8) {
                        let dd = value.slice(0, 2);
                        let mm = value.slice(2, 4);
                        let yyyy = value.slice(4, 8);
                        setFecha({ dd, mm, yyyy });
                      }
                    }}
                    sx={{
                      width: '100%',
                      "& .MuiOutlinedInput-root": { 
                        borderRadius: 2, 
                        bgcolor: "#f8fafc",
                        "& input": { 
                          textAlign: "center",
                          letterSpacing: "2px",
                          fontSize: "16px"
                        }
                      },
                    }}
                  />
                </Grid>
                <Grid>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
                  >
                    {t("time")}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    placeholder="HH:MM"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* COLUMNA DERECHA: Selector del Mapa Corporal */}
            <Grid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#475569" }}>
                  {t("alertFrequency")}
                </Typography>

                <Box
                  sx={{
                    display: "inline-flex",
                    borderRadius: 2,
                    bgcolor: "#e2e8f0",
                    p: 0.5,
                  }}
                >
                  <ButtonBase
                    size="small"
                    onClick={() => setVistaCuerpo("FRENTE")}
                    sx={{
                      bgcolor: vistaCuerpo === "FRENTE" ? "#1e293b" : "transparent",
                      color: vistaCuerpo === "FRENTE" ? "white" : "#475569",
                      borderRadius: 1,
                      px: 2,
                      py: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    {t("front")}
                  </ButtonBase>

                  <ButtonBase
                    size="small"
                    onClick={() => setVistaCuerpo("ATRÁS")}
                    sx={{
                      bgcolor: vistaCuerpo === "ATRÁS" ? "#1e293b" : "transparent",
                      color: vistaCuerpo === "ATRÁS" ? "white" : "#475569",
                      borderRadius: 1,
                      px: 2,
                      py: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    {t("back")}
                  </ButtonBase>
                </Box>
              </Box>

              {/* Zonas del cuerpo */}
              <Grid container spacing={1.5}>
                {zonasActuales.map((zona) => {
                  const esSeleccionado = zonaSeleccionada === zona;
                  const color = getZonaColor(zona, esSeleccionado);

                  return (
                    <Grid key={zona}>
                      <Paper
                        onClick={() => setZonaSeleccionada(zona)}
                        elevation={esSeleccionado ? 3 : 1}
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          bgcolor: esSeleccionado ? color : "white",
                          color: esSeleccionado ? "white" : "#475569",
                          border: esSeleccionado ? "2px solid" : "1px solid #e2e8f0",
                          borderColor: esSeleccionado ? color : "#e2e8f0",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 4,
                          },
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{getZonaIcon(zona)}</span>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: esSeleccionado ? "bold" : "normal",
                            fontSize: "0.8rem",
                          }}
                        >
                          {zona}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Botón Guardar */}
              <Box sx={{ mt: 3 }}>
                <ButtonBase
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={handleGuardar}
                  disabled={loading}
                  sx={{
                    bgcolor: "#1e293b",
                    "&:hover": { bgcolor: "#0f172a" },
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {loading ? t("saving") || "Guardando..." : t("saveMeasurement")}
                </ButtonBase>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}