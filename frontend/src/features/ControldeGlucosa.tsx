import * as React from 'react';
import Footer from '../components/layout/Footer/Footer.tsx';
import Navbar from '../components/layout/Header/Navbar.tsx';
import { CardBase } from '../components/ui/Cards/CardBase.tsx';
import { ButtonBase } from '../components/ui/Buttons/ButtonBase.tsx';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Typography,
  Container,
  Grid,
  Divider,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  ButtonGroup
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

// TIPOS
interface GlucosaRegistro {
  id: number;
  fechaISO: string;
  hora: string;
  nivel: number;
  contexto: string;
  estado: string;
}

interface HbA1cRegistro {
  id: number;
  fechaISO: string;
  fecha: string;
  resultado: number;
  estimado: string;
  estado: string;
}

// DATOS INICIALES (Mock como punto de partida)
const historialGlucosaMock: GlucosaRegistro[] = [
  { id: 1, fechaISO: "2026-06-11T07:15:00", hora: "07:15 AM", nivel: 98, contexto: "En ayunas", estado: "Normal" },
  { id: 2, fechaISO: "2026-06-11T14:30:00", hora: "02:30 PM", nivel: 215, contexto: "Control general", estado: "Alto" },
  { id: 3, fechaISO: "2026-06-10T18:45:00", hora: "06:45 PM", nivel: 62, contexto: "Antes de comer", estado: "Bajo" },
  { id: 4, fechaISO: "2026-06-08T22:00:00", hora: "10:00 PM", nivel: 110, contexto: "Después de comer", estado: "Normal" },
  { id: 5, fechaISO: "2025-05-25T23:00:00", hora: "11:00 PM", nivel: 100, contexto: "Después de comer", estado: "Normal" },
];

const historialHbA1cMock: HbA1cRegistro[] = [
  { id: 1, fechaISO: "2026-05-15T00:00:00", fecha: "15/05/2026", resultado: 6.8, estimado: "148 mg/dL", estado: "En Meta" },
  { id: 2, fechaISO: "2026-01-20T00:00:00", fecha: "20/01/2026", resultado: 7.6, estimado: "172 mg/dL", estado: "Elevado" },
  { id: 3, fechaISO: "2025-09-10T00:00:00", fecha: "10/09/2025", resultado: 8.4, estimado: "195 mg/dL", estado: "Alto" },
];

// HELPERS
const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Alto': case 'Elevado': return 'warning.light';
    case 'Bajo': return 'info.light';
    case 'Normal': case 'En Meta': return 'success.light';
    default: return 'text.primary';
  }
};

// Clasifica el nivel de glucosa según contexto y nivel
const clasificarGlucosa = (nivel: number, contexto: string): string => {
  if (nivel < 70) return 'Bajo';
  if (contexto === 'Ayunas') {
    return nivel <= 100 ? 'Normal' : 'Alto';
  }
  return nivel <= 180 ? 'Normal' : 'Alto';
};

// Formatea una fecha HH:MM a "HH:MM AM/PM"
const formatearHora = (horaStr: string): string => {
  const [hh, mm] = horaStr.split(':').map(Number);
  const periodo = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${periodo}`;
};

// Calcula el eAG (mg/dL estimado) a partir del % HbA1c
const calcularEAG = (resultado: number): number => Math.round(28.7 * resultado - 46.7);

// Clasifica el estado de HbA1c
const clasificarHbA1c = (resultado: number): string => {
  if (resultado < 7) return 'En Meta';
  if (resultado <= 8) return 'Elevado';
  return 'Alto';
};

export default function Glucosa() {
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
    return fechaLocal.toISOString().split('T')[0];
  };

  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  // HISTORIAL (fuente de verdad reactiva)
  const [historialGlucosa, setHistorialGlucosa] = React.useState<GlucosaRegistro[]>(historialGlucosaMock);
  const [historialHbA1c, setHistorialHbA1c] = React.useState<HbA1cRegistro[]>(historialHbA1cMock);

  // ESTADOS DE MODALES
  const [openGlucosa, setOpenGlucosa] = React.useState(false);
  const [openHbA1c, setOpenHbA1c] = React.useState(false);

  // CAMPOS DEL FORMULARIO DE GLUCOSA
  const [nivelGlucosa, setNivelGlucosa] = React.useState<string>('');
  const [contexto, setContexto] = React.useState('');
  const [fechaGlucosa, setFechaGlucosa] = React.useState('');
  const [hora, setHora] = React.useState('');

  // CAMPOS DEL FORMULARIO DE HBA1C
  const [resultadoHbA1c, setResultadoHbA1c] = React.useState<string>('');
  const [fechaHbA1c, setFechaHbA1c] = React.useState('');

  // FILTROS TEMPORALES
  const [filtroGlucosa, setFiltroGlucosa] = React.useState<'hoy' | 'semana' | 'mes'>('mes');
  const [filtroHbA1c, setFiltroHbA1c] = React.useState<'trimestre' | 'año' | 'todos'>('todos');

  // PAGINACIÓN
  const [pageGlucosa, setPageGlucosa] = React.useState(0);
  const [rowsPerPageGlucosa, setRowsPerPageGlucosa] = React.useState(4);
  const [pageHbA1c, setPageHbA1c] = React.useState(0);
  const [rowsPerPageHbA1c, setRowsPerPageHbA1c] = React.useState(4);

  // HANDLERS DE MODAL
  const handleOpenGlucosa = () => {
    setNivelGlucosa('');
    setContexto('');
    setFechaGlucosa(obtenerFechaActual());
    setHora(obtenerHoraActual());
    setOpenGlucosa(true);
  };

  const handleCloseGlucosa = () => {
    setOpenGlucosa(false);
  };

  const handleOpenHbA1c = () => {
    setResultadoHbA1c('');
    setFechaHbA1c(obtenerFechaActual());
    setOpenHbA1c(true);
  };

  const handleCloseHbA1c = () => setOpenHbA1c(false);

  // GUARDAR GLUCOSA
  const handleGuardarGlucosa = () => {
    const nivel = parseFloat(nivelGlucosa);
    if (isNaN(nivel) || nivel <= 0 || !contexto || !fechaGlucosa || !hora) return;

    const fechaISO = `${fechaGlucosa}T${hora}:00`;
    const nuevoRegistro: GlucosaRegistro = {
      id: Date.now(),
      fechaISO,
      hora: formatearHora(hora),
      nivel,
      contexto,
      estado: clasificarGlucosa(nivel, contexto),
    };

    setHistorialGlucosa(prev => [nuevoRegistro, ...prev]);
    setPageGlucosa(0);
    handleCloseGlucosa();
  };

  // GUARDAR HBA1C
  const handleGuardarHbA1c = () => {
    const resultado = parseFloat(resultadoHbA1c);
    if (isNaN(resultado) || resultado <= 0 || resultado > 20 || !fechaHbA1c) return;

    const eag = calcularEAG(resultado);
    const [anio, mes, dia] = fechaHbA1c.split('-');
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    const nuevoRegistro: HbA1cRegistro = {
      id: Date.now(),
      fechaISO: `${fechaHbA1c}T00:00:00`,
      fecha: fechaFormateada,
      resultado,
      estimado: `${eag} mg/dL`,
      estado: clasificarHbA1c(resultado),
    };

    setHistorialHbA1c(prev => [nuevoRegistro, ...prev]);
    setPageHbA1c(0);
    handleCloseHbA1c();
  };

  // FILTRADO CON useMemo
  const glucosaFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialGlucosa.filter(item => {
      const fechaItem = new Date(item.fechaISO);
      if (filtroGlucosa === 'hoy') {
        return fechaItem.toDateString() === ahora.toDateString();
      }
      if (filtroGlucosa === 'semana') {
        const sieteDiasAtras = new Date();
        sieteDiasAtras.setDate(ahora.getDate() - 7);
        return fechaItem >= sieteDiasAtras;
      }
      if (filtroGlucosa === 'mes') {
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(ahora.getDate() - 30);
        return fechaItem >= treintaDiasAtras;
      }
      return true;
    });
    return [...filtrados].sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());
  }, [historialGlucosa, filtroGlucosa]);

  const hbA1cFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialHbA1c.filter(item => {
      const fechaItem = new Date(item.fechaISO);
      if (filtroHbA1c === 'trimestre') {
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(ahora.getMonth() - 3);
        return fechaItem >= tresMesesAtras;
      }
      if (filtroHbA1c === 'año') {
        const unAñoAtras = new Date();
        unAñoAtras.setFullYear(ahora.getFullYear() - 1);
        return fechaItem >= unAñoAtras;
      }
      return true;
    });
    return [...filtrados].sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());
  }, [historialHbA1c, filtroHbA1c]);

  // MÉTRICAS DINÁMICAS DE GLUCOSA
  const metricasGlucosa = React.useMemo(() => {
    const total = historialGlucosa.length;
    if (total === 0) return { tir: 0, hiper: 0, hipo: 0, enRango: 0, colorTIR: 'error.light', mensajeTIR: 'Sin registros aún.' };

    const hiper = historialGlucosa.filter(r => r.estado === 'Alto').length;
    const hipo = historialGlucosa.filter(r => r.estado === 'Bajo').length;
    const enRango = historialGlucosa.filter(r => r.estado === 'Normal').length;
    const tir = Math.round((enRango / total) * 100);

    let colorTIR: string;
    let mensajeTIR: string;
    if (tir >= 70) {
      colorTIR = 'success.light';
      mensajeTIR = '¡Excelente control! Sigue así.';
    } else if (tir >= 50) {
      colorTIR = 'warning.light';
      mensajeTIR = 'Control moderado. Consulta tu médico.';
    } else {
      colorTIR = 'error.light';
      mensajeTIR = 'Niveles bajos. Revisa tus registros y actúa.';
    }

    return { tir, hiper, hipo, enRango, colorTIR, mensajeTIR };
  }, [historialGlucosa]);

  // Porcentajes para las barras de progreso (sobre el total)
  const totalGlucosa = historialGlucosa.length || 1;
  const pctHiper = Math.round((metricasGlucosa.hiper / totalGlucosa) * 100);
  const pctHipo = Math.round((metricasGlucosa.hipo / totalGlucosa) * 100);
  const pctEnRango = Math.round((metricasGlucosa.enRango / totalGlucosa) * 100);

  // ÚLTIMO RESULTADO HBA1C
  const ultimoHbA1c = React.useMemo(() => {
    if (historialHbA1c.length === 0) return null;
    return [...historialHbA1c].sort(
      (a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime()
    )[0];
  }, [historialHbA1c]);

  // DATOS PARA LOS GRÁFICOS
  const horasGlucosa = glucosaFiltrada.map(item => item.hora);
  const nivelesGlucosa = glucosaFiltrada.map(item => item.nivel);

  const fechasHbA1c = hbA1cFiltrada.map(item => item.fecha);
  const resultadosHbA1c = hbA1cFiltrada.map(item => item.resultado);

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 6, mb: 7 }}>

        {/* SECCIÓN GLUCEMIA */}
        <Box component="section" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
            Monitoreo Diario de Glucosa
          </Typography>

          <Grid container spacing={3}>
            {/* Columna Izquierda: Métricas */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                <ButtonBase onClick={handleOpenGlucosa} startIcon={<AddIcon />}> Registrar Nueva Medición</ButtonBase>

                {/* MODAL DE GLUCOSA */}
                <Modal open={openGlucosa} onClose={handleCloseGlucosa} aria-labelledby="modal-glucose-title">
                  <Box sx={{
                    display: "flex", flexDirection: "column", alignItems: "stretch",
                    position: 'absolute' as const, top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', width: 450,
                    bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4
                  }}>
                    <Typography id="modal-glucose-title" variant="h6" component="h2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                      Registrar Nueva Medición
                    </Typography>

                    <TextField
                      fullWidth
                      margin="normal"
                      id="glucose-level"
                      label="Nivel de Glucosa (mg/dL)"
                      type="number"
                      value={nivelGlucosa}
                      onChange={(e) => setNivelGlucosa(e.target.value)}
                      slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    />

                    <FormControl fullWidth margin="normal">
                      <InputLabel id="contexto-medicion-label">Contexto de la Medición</InputLabel>
                      <Select
                        labelId="contexto-medicion-label"
                        value={contexto}
                        label="Contexto de la Medición"
                        onChange={(e) => setContexto(e.target.value)}
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
                          value={fechaGlucosa}
                          onChange={(e) => setFechaGlucosa(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 5 }}>
                        <TextField
                          fullWidth
                          label="Hora"
                          type="time"
                          slotProps={{ inputLabel: { shrink: true } }}
                          value={hora}
                          onChange={(e) => setHora(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Button
                      onClick={handleGuardarGlucosa}
                      sx={{ mt: 3, py: 1 }}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!nivelGlucosa || !contexto || !fechaGlucosa || !hora}
                    >
                      Guardar Medición
                    </Button>
                  </Box>
                </Modal>

                {/* Dominio de la Zona Segura */}
                <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Dominio de la Zona Segura
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: metricasGlucosa.colorTIR }}>
                    {metricasGlucosa.tir}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tiempo en rango
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: metricasGlucosa.colorTIR }}>
                    {metricasGlucosa.mensajeTIR}
                  </Typography>
                </CardBase>

                {/* Frecuencia de Alertas*/}
                <CardBase sx={{ display: "flex", flexDirection: "column", p: 3, width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center", mb: 3, color: "text.primary" }}>
                    Frecuencia de Alertas
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
                    {/* Hiperglucemias */}
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        Hiperglucemias
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={pctHiper}
                          sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'warning.light', borderRadius: 3 } }}
                        />
                        <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${Math.max(pctHiper, 8)}% - 18px)`, color: '#fff', fontWeight: 700 }}>
                          {metricasGlucosa.hiper}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Hipoglucemias */}
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        Hipoglucemias
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={pctHipo}
                          sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'info.light', borderRadius: 3 } }}
                        />
                        <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${Math.max(pctHipo, 8)}% - 18px)`, color: '#fff', fontWeight: 700 }}>
                          {metricasGlucosa.hipo}
                        </Typography>
                      </Box>
                    </Box>

                    {/* En rango objetivo */}
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        En rango objetivo
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={pctEnRango}
                          sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'success.light', borderRadius: 3 } }}
                        />
                        <Typography variant="caption" sx={{ position: 'absolute', left: `calc(${Math.max(pctEnRango, 8)}% - 18px)`, color: '#fff', fontWeight: 700 }}>
                          {metricasGlucosa.enRango}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardBase>
              </Box>
            </Grid>

            {/* Columna Derecha: Gráfico con Filtros e Historial */}
            <Grid size={{ xs: 12, md: 7 }}>
              <CardBase sx={{ display: 'flex', flexDirection: 'column', minHeight: 560, height: '100%', p: 3 }}>

                {/* Cabecera Interactiva del Filtro de Glucosa */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600 }}>
                    Evolución de Glucemia
                  </Typography>
                  <ButtonGroup variant="outlined" size="small" aria-label="Filtros de glucosa">
                    <Button
                      onClick={() => { setFiltroGlucosa('hoy'); setPageGlucosa(0); }}
                      variant={filtroGlucosa === 'hoy' ? 'contained' : 'outlined'}
                    >
                      Hoy
                    </Button>
                    <Button
                      onClick={() => { setFiltroGlucosa('semana'); setPageGlucosa(0); }}
                      variant={filtroGlucosa === 'semana' ? 'contained' : 'outlined'}
                    >
                      Semana
                    </Button>
                    <Button
                      onClick={() => { setFiltroGlucosa('mes'); setPageGlucosa(0); }}
                      variant={filtroGlucosa === 'mes' ? 'contained' : 'outlined'}
                    >
                      Mes
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* GRÁFICO DE GLUCOSA */}
                <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {nivelesGlucosa.length > 0 ? (
                    <LineChart
                      xAxis={[{ scaleType: 'point', data: horasGlucosa }]}
                      series={[
                        {
                          data: nivelesGlucosa,
                          label: 'Nivel (mg/dL)',
                          color: '#94c2e6',
                          curve: 'catmullRom',
                        },
                      ]}
                      sx={(theme) => ({
                        '& .MuiLineElement-root': {
                          strokeWidth: 2,
                        },
                        '& .MuiMarkElement-root': {
                          stroke: '#94c2e6',
                          strokeWidth: 2,
                          fill: theme.palette.mode === 'dark' ? '#1E1E1E' : '#ffffff',
                          scale: '1.1',
                        },
                        '& .MuiChartsAxis-tickLabel': {
                          fill: theme.palette.text.secondary + ' !important',
                        },
                        '& .MuiChartsAxis-line': {
                          stroke: theme.palette.divider + ' !important',
                        },
                        '& .MuiChartsAxis-tick': {
                          stroke: theme.palette.divider + ' !important',
                        },
                        '& .MuiChartsLegend-root text': {
                          fill: theme.palette.text.primary + ' !important',
                        },
                      })}
                      height={220}
                      margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">Sin registros para graficar</Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600, my: 3 }}>
                  Historial de Registros
                </Typography>

                {/* TABLA DE REGISTROS DE GLUCOSA */}
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, border: 'none' }}>
                  <Table size="small" aria-label="tabla de glucosa">
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Hora</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nivel (mg/dL)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Contexto</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...glucosaFiltrada].reverse()
                        .slice(pageGlucosa * rowsPerPageGlucosa, pageGlucosa * rowsPerPageGlucosa + rowsPerPageGlucosa)
                        .map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.hora}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.nivel}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.contexto}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: obtenerColorEstado(row.estado) }}>
                              {row.estado}
                            </TableCell>
                          </TableRow>
                        ))}
                      {glucosaFiltrada.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                            No hay registros para este periodo temporal.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[4, 10, 25]}
                  component="div"
                  count={glucosaFiltrada.length}
                  rowsPerPage={rowsPerPageGlucosa}
                  page={pageGlucosa}
                  onPageChange={(_, newPage) => setPageGlucosa(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPageGlucosa(parseInt(e.target.value, 10));
                    setPageGlucosa(0);
                  }}
                  labelRowsPerPage="Filas por páginas:"
                />
              </CardBase>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ marginY: 8, borderColor: "primary.light" }} />

        {/* SECCIÓN HEMOGLOBINA GLICOSILADA */}
        <Box component="section" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
            Historial de Hemoglobina Glicosilada (HbA1c)
          </Typography>

          <Grid container spacing={3}>
            {/* Columna Izquierda: Métricas */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <ButtonBase onClick={handleOpenHbA1c} startIcon={<AddIcon />}> Registrar Resultado de Laboratorio</ButtonBase>

                {/* MODAL DE HEMOGLOBINA GLICOSILADA */}
                <Modal open={openHbA1c} onClose={handleCloseHbA1c} aria-labelledby="modal-hba1c-title">
                  <Box sx={{
                    display: "flex", flexDirection: "column", alignItems: "stretch",
                    position: 'absolute' as const, top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', width: 450,
                    bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4
                  }}>
                    <Typography id="modal-hba1c-title" variant="h6" component="h2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                      Registrar Resultado HbA1c
                    </Typography>

                    <TextField
                      fullWidth
                      margin="normal"
                      id="hba1c-level"
                      label="Resultado del Laboratorio (%)"
                      type="number"
                      value={resultadoHbA1c}
                      onChange={(e) => setResultadoHbA1c(e.target.value)}
                      slotProps={{ htmlInput: { min: 1, max: 20, step: 0.1 } }}
                    />

                    {/* Vista previa del eAG en tiempo real */}
                    {resultadoHbA1c && !isNaN(parseFloat(resultadoHbA1c)) && parseFloat(resultadoHbA1c) > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 1 }}>
                        eAG estimado: <strong>{calcularEAG(parseFloat(resultadoHbA1c))} mg/dL</strong>
                        {' · '}Estado: <strong style={{ color: clasificarHbA1c(parseFloat(resultadoHbA1c)) === 'En Meta' ? '#81c784' : clasificarHbA1c(parseFloat(resultadoHbA1c)) === 'Elevado' ? '#ffb74d' : '#e57373' }}>
                          {clasificarHbA1c(parseFloat(resultadoHbA1c))}
                        </strong>
                      </Typography>
                    )}

                    <TextField
                      fullWidth
                      margin="normal"
                      label="Fecha del Análisis"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={fechaHbA1c}
                      onChange={(e) => setFechaHbA1c(e.target.value)}
                    />

                    <Button
                      onClick={handleGuardarHbA1c}
                      sx={{ mt: 3, py: 1 }}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!resultadoHbA1c || !fechaHbA1c}
                    >
                      Guardar Resultado
                    </Button>
                  </Box>
                </Modal>

                {/* Último Resultado */}
                <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Último Resultado
                  </Typography>
                  {ultimoHbA1c ? (
                    <>
                      <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: obtenerColorEstado(ultimoHbA1c.estado) }}>
                        {ultimoHbA1c.resultado}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        eAG estimada: {ultimoHbA1c.estimado}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: obtenerColorEstado(ultimoHbA1c.estado) }}>
                        {ultimoHbA1c.estado === 'En Meta'
                          ? 'Dentro del Rango Objetivo'
                          : ultimoHbA1c.estado === 'Elevado'
                            ? 'Ligeramente Elevado'
                            : 'Nivel Alto — Consulta tu médico'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Sin resultados registrados
                    </Typography>
                  )}
                </CardBase>
              </Box>
            </Grid>

            {/* Columna Derecha: Gráfico HbA1c e Historial */}
            <Grid size={{ xs: 12, md: 7 }}>
              <CardBase sx={{ display: 'flex', flexDirection: 'column', minHeight: 560, height: '100%', p: 3 }}>

                {/* Cabecera Interactiva del Filtro de HbA1c */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600 }}>
                    Evolución de HbA1c
                  </Typography>
                  <ButtonGroup variant="outlined" size="small" aria-label="Filtros de hba1c">
                    <Button
                      onClick={() => { setFiltroHbA1c('trimestre'); setPageHbA1c(0); }}
                      variant={filtroHbA1c === 'trimestre' ? 'contained' : 'outlined'}
                    >
                      Trimestre
                    </Button>
                    <Button
                      onClick={() => { setFiltroHbA1c('año'); setPageHbA1c(0); }}
                      variant={filtroHbA1c === 'año' ? 'contained' : 'outlined'}
                    >
                      Año
                    </Button>
                    <Button
                      onClick={() => { setFiltroHbA1c('todos'); setPageHbA1c(0); }}
                      variant={filtroHbA1c === 'todos' ? 'contained' : 'outlined'}
                    >
                      Todos
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* GRÁFICO DE HBA1C */}
                <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {resultadosHbA1c.length > 0 ? (
                    <LineChart
                      xAxis={[{ scaleType: 'point', data: fechasHbA1c }]}
                      series={[
                        {
                          data: resultadosHbA1c,
                          label: 'Resultado (%)',
                          color: '#81c784',
                          curve: 'catmullRom',
                        },
                      ]}
                      sx={(theme) => ({
                        '& .MuiLineElement-root': {
                          strokeWidth: 2,
                        },
                        '& .MuiMarkElement-root': {
                          stroke: '#81c784',
                          strokeWidth: 2,
                          fill: theme.palette.mode === 'dark' ? '#1E1E1E' : '#ffffff',
                          scale: '1.1',
                        },
                        '& .MuiChartsAxis-tickLabel': {
                          fill: theme.palette.text.secondary + ' !important',
                        },
                        '& .MuiChartsAxis-line': {
                          stroke: theme.palette.divider + ' !important',
                        },
                        '& .MuiChartsAxis-tick': {
                          stroke: theme.palette.divider + ' !important',
                        },
                        '& .MuiChartsLegend-root text': {
                          fill: theme.palette.text.primary + ' !important',
                        },
                      })}
                      height={220}
                      margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">Sin exámenes en este periodo</Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark', fontWeight: 600, my: 3 }}>
                  Historial de Laboratorios
                </Typography>

                {/* TABLA DE REGISTROS DE HBA1C */}
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, border: 'none' }}>
                  <Table size="small" aria-label="tabla de hba1c">
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Fecha de Examen</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Resultado (HbA1c)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Estimado Promedio</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...hbA1cFiltrada].reverse()
                        .slice(pageHbA1c * rowsPerPageHbA1c, pageHbA1c * rowsPerPageHbA1c + rowsPerPageHbA1c)
                        .map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.fecha}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>
                              {typeof row.resultado === 'number' ? `${row.resultado} %` : row.resultado}
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.estimado}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: obtenerColorEstado(row.estado) }}>
                              {row.estado}
                            </TableCell>
                          </TableRow>
                        ))}
                      {hbA1cFiltrada.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                            No hay exámenes en este rango seleccionado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[4, 10, 25]}
                  component="div"
                  count={hbA1cFiltrada.length}
                  rowsPerPage={rowsPerPageHbA1c}
                  page={pageHbA1c}
                  onPageChange={(_, newPage) => setPageHbA1c(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPageHbA1c(parseInt(e.target.value, 10));
                    setPageHbA1c(0);
                  }}
                  labelRowsPerPage="Filas por páginas:"
                />
              </CardBase>
            </Grid>
          </Grid>
        </Box>

      </Container>
      <Footer />
    </>
  );
}