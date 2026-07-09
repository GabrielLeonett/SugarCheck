// features/Insulina/components/ModalInsulinaRapida.tsx
import { Typography, Box, Grid, TextField, IconButton, MenuItem, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { ButtonBase } from "../../../components/ui/Buttons/ButtonBase.tsx";
import { Modal } from "../../../components/ui/Modals/Modals.tsx";

// ✅ Interfaz para las props
interface ModalInsulinaRapidaProps {
  open: boolean;
  onClose: () => void;
}

// ✅ Componente principal
export default function ModalInsulinaRapida({ open, onClose }: ModalInsulinaRapidaProps) {
  // Estados del formulario
  const [unidades, setUnidades] = useState<number>(0);
  const [contexto, setContexto] = useState<string>("");
  const [fecha, setFecha] = useState({ dd: "23", mm: "06", yyyy: "2026" });
  const [hora, setHora] = useState("14:11");

  // Estados del selector de zonas
  const [vistaCuerpo, setVistaCuerpo] = useState<"FRENTE" | "ATRÁS">("FRENTE");
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("Abdomen Izquierdo");

  // Definición de zonas
  const zonasFrente = [
    "Abdomen Derecho",
    "Abdomen Izquierdo",
    "Muslo Derecho",
    "Muslo Izquierdo",
  ];
  
  const zonasAtras = [
    "Brazo Derecho",
    "Brazo Izquierdo",
    "Glúteo Derecho",
    "Glúteo Izquierdo",
  ];

  // Zonas según la vista seleccionada
  const zonasActuales = vistaCuerpo === "FRENTE" ? zonasFrente : zonasAtras;

  // Función para obtener el color según la zona
  const getZonaColor = (zona: string, esSeleccionado: boolean) => {
    if (!esSeleccionado) return "#e2e8f0";
    
    if (zona.includes("Abdomen")) return "#ef4444";
    if (zona.includes("Glúteo")) return "#22c55e";
    if (zona.includes("Muslo")) return "#f59e0b";
    if (zona.includes("Brazo")) return "#f97316";
    return "#64748b";
  };

  // Función para obtener el icono de la zona
  const getZonaIcon = (zona: string) => {
    if (zona.includes("Abdomen")) return "⬤";
    if (zona.includes("Glúteo")) return "⬤";
    if (zona.includes("Muslo")) return "⬤";
    if (zona.includes("Brazo")) return "⬤";
    return "⬤";
  };

  // Función para resetear el formulario
  const resetFormulario = () => {
    setUnidades(0);
    setContexto("");
    setFecha({ dd: "23", mm: "06", yyyy: "2026" });
    setHora("14:11");
    setZonaSeleccionada("Abdomen Izquierdo");
  };

  // Función para guardar
  const handleGuardar = () => {
    if (unidades === 0) {
      alert("Por favor ingresa las unidades");
      return;
    }
    if (!contexto) {
      alert("Por favor selecciona un contexto");
      return;
    }
    
    console.log({
      unidades,
      contexto,
      fecha: `${fecha.dd}/${fecha.mm}/${fecha.yyyy}`,
      hora,
      zona: zonaSeleccionada,
      vista: vistaCuerpo,
      tipo: "Rápida"
    });
    
    resetFormulario();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 0, maxWidth: 900, mx: "auto" }}>
        {/* Header con título y porcentaje */}
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
              Registrar Aplicación de Dosis Rápida
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* COLUMNA IZQUIERDA: Formulario */}
            <Grid>
              {/* Unidades */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "#475569", mb: 1 }}
                >
                  Nivel de Glucosa (mg/dL)
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
                    onClick={() => setUnidades((prev) => Math.max(0, prev - 1))}
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
                    value={unidades === 0 ? "" : unidades}
                    placeholder="0"
                    onChange={(e) => setUnidades(Number(e.target.value))}
                    type="number"
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
                    onClick={() => setUnidades((prev) => prev + 1)}
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
                  Contexto de la Medición
                </Typography>
              </Box>

              {/* Contexto de Aplicación */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
                >
                  Contexto de Aplicación
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" },
                  }}
                >
                  <MenuItem value="">
                    <em>Seleccionar</em>
                  </MenuItem>
                  <MenuItem value="Desayuno">Antes del Desayuno</MenuItem>
                  <MenuItem value="Almuerzo">Antes del Almuerzo</MenuItem>
                  <MenuItem value="Cena">Antes de la Cena</MenuItem>
                  <MenuItem value="Corrección">Corrección</MenuItem>
                </TextField>
              </Box>

              {/* Fecha y Hora */}
              <Grid container spacing={2}>
                <Grid>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
                  >
                    Fecha
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
                    Hora
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    placeholder="HH:MM"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" },
                      "& input": { textAlign: "center" }
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
                  Zona de Aplicación
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
                    FRENTE
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
                    ATRÁS
                  </ButtonBase>
                </Box>
              </Box>

              {/* Zonas del cuerpo */}
              <Grid container spacing={1.5}>
                {zonasActuales.map((zona) => {
                  const esSeleccionado = zonaSeleccionada === zona;
                  const color = getZonaColor(zona, esSeleccionado);

                  return (
                    <Grid>
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

              {/* Botón Guardar Medición */}
              <Box sx={{ mt: 3 }}>
                <ButtonBase
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={handleGuardar}
                  sx={{
                    bgcolor: "#1e293b",
                    "&:hover": { bgcolor: "#0f172a" },
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Guardar Medición
                </ButtonBase>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}