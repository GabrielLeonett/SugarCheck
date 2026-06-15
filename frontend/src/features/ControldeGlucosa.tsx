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

// Importamos componentes nativos de MUI X-Charts
import { LineChart } from '@mui/x-charts/LineChart';

// --- ESTRUCTURA DE DATOS SIMULADOS ---
const historialGlucosaMock = [
  { id: 1, fechaISO: "2026-06-11T07:15:00", hora: "07 : 15 AM", nivel: 98, contexto: "En ayunas", estado: "Normal" },
  { id: 2, fechaISO: "2026-06-11T14:30:00", hora: "02 : 30 PM", nivel: 215, contexto: "Control general", estado: "Alto" },
  { id: 3, fechaISO: "2026-06-10T18:45:00", hora: "06 : 45 PM", nivel: 62, contexto: "Antes de comer", estado: "Bajo" },
  { id: 4, fechaISO: "2026-06-08T22:00:00", hora: "10 : 00 PM", nivel: 110, contexto: "Después de comer", estado: "Normal" },
  { id: 5, fechaISO: "2025-05-25T23:00:00", hora: "11 : 00 PM", nivel: 100, contexto: "Después de comer", estado: "Normal" },
];

const historialHbA1cMock = [
  { id: 1, fechaISO: "2026-05-15T00:00:00", fecha: "15/05/2026", resultado: 6.8, estimado: "148 mg/dL", estado: "En Meta" },
  { id: 2, fechaISO: "2026-01-20T00:00:00", fecha: "20/01/2026", resultado: 7.6, estimado: "172 mg/dL", estado: "Elevado" },
  { id: 3, fechaISO: "2025-09-10T00:00:00", fecha: "10/09/2025", resultado: 8.4, estimado: "195 mg/dL", estado: "Alto" },
];

const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Alto': case 'Elevado': return 'warning.light';
    case 'Bajo': return 'info.light';
    case 'Normal': case 'En Meta': return 'success.light'; 
    default: return 'text.primary';
  }
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

  // Estados de control de Modales
  const [fechaGlucosa, setFechaGlucosa] = React.useState("");
  const [hora, setHora] = React.useState("");
  const [contexto, setContexto] = React.useState("");
  const [fechaHbA1c, setFechaHbA1c] = React.useState("");
  const [openGlucosa, setOpenGlucosa] = React.useState(false);
  const [openHbA1c, setOpenHbA1c] = React.useState(false);

  // Filtros temporales independientes
  const [filtroGlucosa, setFiltroGlucosa] = React.useState<'hoy' | 'semana' | 'mes'>('mes');
  const [filtroHbA1c, setFiltroHbA1c] = React.useState<'trimestre' | 'año' | 'todos'>('todos');

  // Estados de Paginación
  const [pageGlucosa, setPageGlucosa] = React.useState(0);
  const [rowsPerPageGlucosa, setRowsPerPageGlucosa] = React.useState(4);

  const [pageHbA1c, setPageHbA1c] = React.useState(0);
  const [rowsPerPageHbA1c, setRowsPerPageHbA1c] = React.useState(4);

  const handleOpenGlucosa = () => {
    setFechaGlucosa(obtenerFechaActual());
    setHora(obtenerHoraActual());
    setOpenGlucosa(true);
  };

  const handleCloseGlucosa = () => {
    setOpenGlucosa(false);
    setContexto(""); 
  };

  const handleOpenHbA1c = () => {
    setFechaHbA1c(obtenerFechaActual());
    setOpenHbA1c(true);
  };

  const handleCloseHbA1c = () => setOpenHbA1c(false);

  // Procesamiento de Filtros con useMemo
  const glucosaFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialGlucosaMock.filter(item => {
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
    return [...filtrados].reverse();
  }, [filtroGlucosa]);

  const hbA1cFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialHbA1cMock.filter(item => {
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
    return [...filtrados].reverse();
  }, [filtroHbA1c]);

  // Arreglos primitivos para X-Charts
  const horasGlucosa = glucosaFiltrada.map(item => item.hora.replace(/\s+/g, ''));
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
                    <Typography id="modal-glucose-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                      Registrar Nueva Medición
                    </Typography>

                    <TextField fullWidth margin="normal" id="glucose-level" label="Nivel de Glucosa (mg/dL)" type="number" />

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

                    <Button onClick={handleCloseGlucosa} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
                      Guardar Medición
                    </Button>
                  </Box>
                </Modal>

                {/* Dominio de la Zona Segura */}
                <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Dominio de la Zona Segura
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: "error.light" }}>
                    45%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tiempo en rango
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: "error.light" }}>
                    Niveles bajos. Revisa tus registros y actúa
                  </Typography>
                </CardBase>
                
                {/* Frecuencia de Alertas */}
                <CardBase sx={{ display: "flex", flexDirection: "column", p: 3, width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center", mb: 3, color: "text.primary" }}>
                    Frecuencia de Alertas
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        Hiperglucemias
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress variant="determinate" value={70} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'warning.light', borderRadius: 3 } }} />
                        <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(70% - 20px)', color: '#fff', fontWeight: 700 }}>4</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        Hipoglucemias
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress variant="determinate" value={30} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'info.light', borderRadius: 3 } }} />
                        <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(30% - 20px)', color: '#fff', fontWeight: 700 }}>1</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                        En rango objetivo
                      </Typography>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress variant="determinate" value={85} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'success.light', borderRadius: 3 } }} />
                        <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(85% - 20px)', color: '#fff', fontWeight: 700 }}>9</Typography>
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
                  <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
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
                
                {/* --- GRÁFICO DE GLUCOSA CON X-CHARTS --- */}
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
                      sx={{
                        '& .MuiLineElement-root': {
                          strokeWidth: 2,
                        },
                        '& .MuiMarkElement-root': {
                          stroke: '#94c2e6',
                          strokeWidth: 2,
                          fill: '#ffffff',
                          scale: '1.1',
                        },
                      }}
                      height={220}
                      margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">Sin registros para graficar</Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, my: 3 }}>
                  Historial de Registros
                </Typography>

                {/* --- TABLA DE REGISTROS DE GLUCOSA --- */}
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
                    <Typography id="modal-hba1c-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                      Registrar Resultado HbA1c
                    </Typography>

                    <TextField fullWidth margin="normal" id="hba1c-level" label="Resultado del Laboratorio (%)" type="number" />

                    <TextField
                      fullWidth
                      margin="normal"
                      label="Fecha del Análisis"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={fechaHbA1c}
                      onChange={(e) => setFechaHbA1c(e.target.value)} 
                    />

                    <Button onClick={handleCloseHbA1c} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
                      Guardar Resultado
                    </Button>
                  </Box>
                </Modal>

                {/* Último Resultado */}
                <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Último Resultado
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: "success.light" }}>
                    6.8%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    eAG estimada: 148 mg/dL
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: "success.light" }}>
                    Dentro del Rango Objetivo
                  </Typography>
                </CardBase>
              </Box>
            </Grid>

            {/* Columna Derecha: Gráfico HbA1c e Historial */}
            <Grid size={{ xs: 12, md: 7 }}>
              <CardBase sx={{ display: 'flex', flexDirection: 'column', minHeight: 560, height: '100%', p: 3 }}>
                
                {/* Cabecera Interactiva del Filtro de HbA1c */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
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
                
                {/* --- GRÁFICO DE HBA1C --- */}
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
                      sx={{
                        '& .MuiLineElement-root': {
                          strokeWidth: 2,
                        },
                        '& .MuiMarkElement-root': {
                          stroke: '#81c784',
                          strokeWidth: 2,
                          fill: '#ffffff',
                          scale: '1.1',
                        },
                      }}
                      height={220}
                      margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">Sin exámenes en este periodo</Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, my: 3 }}>
                  Historial de Laboratorios
                </Typography>

                {/* --- TABLA DE REGISTROS DE HBA1C --- */}
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