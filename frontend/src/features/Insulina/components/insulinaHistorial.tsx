// features/Insulina/components/InsulinaHistorial.tsx
import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  ButtonGroup,
  Button,
  Grid,
} from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';
import useLanguage from "../../../hooks/useLanguage";

// Mock data para insulina
const registrosMock = [
  { id: 1, hora: "07:15 AM", tipo: "Lenta / Basal", dosis: 9, zona: "Abdomen", contexto: "Mañana" },
  { id: 2, hora: "02:30 PM", tipo: "Rápida / Bolus", dosis: 2, zona: "Brazo", contexto: "Corrección" },
  { id: 3, hora: "06:45 PM", tipo: "Rápida / Bolus", dosis: 4, zona: "Muslo", contexto: "Antes de comer" },
  { id: 4, hora: "08:00 AM", tipo: "Lenta / Basal", dosis: 8, zona: "Abdomen", contexto: "Desayuno" },
  { id: 5, hora: "12:30 PM", tipo: "Rápida / Bolus", dosis: 3, zona: "Brazo", contexto: "Almuerzo" },
  { id: 6, hora: "09:00 PM", tipo: "Lenta / Basal", dosis: 10, zona: "Glúteo", contexto: "Noche" },
  { id: 7, hora: "04:00 PM", tipo: "Rápida / Bolus", dosis: 5, zona: "Muslo", contexto: "Corrección" },
  { id: 8, hora: "11:00 AM", tipo: "Rápida / Bolus", dosis: 6, zona: "Brazo", contexto: "Antes de comer" },
  { id: 9, hora: "10:00 PM", tipo: "Lenta / Basal", dosis: 7, zona: "Abdomen", contexto: "Noche" },
  { id: 10, hora: "01:00 PM", tipo: "Rápida / Bolus", dosis: 4, zona: "Muslo", contexto: "Corrección" },
];

export default function InsulinaHistorial() {
  const { t } = useLanguage('insulinaHistorial');
  
  const [filtro, setFiltro] = useState<'todas' | 'lenta' | 'rapida'>('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const obtenerColorTipo = (tipo: string) => {
    if (tipo.includes("Lenta")) return 'warning.light';
    if (tipo.includes("Rápida")) return 'info.light';
    return 'text.primary';
  };

  // Filtrar insulina según el tipo seleccionado
  const insulinaFiltrada = useMemo(() => {
    let filtrados = registrosMock;
    
    if (filtro === 'lenta') {
      filtrados = registrosMock.filter(item => item.tipo.includes("Lenta"));
    } else if (filtro === 'rapida') {
      filtrados = registrosMock.filter(item => item.tipo.includes("Rápida"));
    }
    
    return [...filtrados].reverse();
  }, [filtro]);

  // Datos para el gráfico
  const horasInsulina = insulinaFiltrada.map(item => item.hora.replace(/\s+/g, ''));
  const dosisInsulina = insulinaFiltrada.map(item => item.dosis);

  return (
    <Paper 
      sx={{ 
        p: 3,
        borderRadius: 2,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #E5E7EB'
      }}
    >
      <Grid container spacing={3}>
        {/* Gráfico de Insulina */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 400, height: '100%' }}>
            
            {/* Cabecera con Filtros */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
                {t('evolucionInsulina')}
              </Typography>
              <ButtonGroup variant="outlined" size="small" aria-label="Filtros de insulina">
                <Button 
                  onClick={() => { setFiltro('todas'); setPage(0); }}
                  variant={filtro === 'todas' ? 'contained' : 'outlined'}
                >
                  {t('todas')}
                </Button>
                <Button 
                  onClick={() => { setFiltro('lenta'); setPage(0); }}
                  variant={filtro === 'lenta' ? 'contained' : 'outlined'}
                >
                  {t('lenta')}
                </Button>
                <Button 
                  onClick={() => { setFiltro('rapida'); setPage(0); }}
                  variant={filtro === 'rapida' ? 'contained' : 'outlined'}
                >
                  {t('rapida')}
                </Button>
              </ButtonGroup>
            </Box>
            
            {/* Gráfico de Insulina con X-Charts */}
            <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {insulinaFiltrada.length > 0 ? (
                <LineChart
                  xAxis={[{ scaleType: 'point', data: horasInsulina }]}
                  series={[
                    {
                      data: dosisInsulina,
                      label: t('dosisUi'),
                      color: filtro === 'lenta' ? '#FFA726' : '#4FC3F7',
                      curve: 'catmullRom',
                    },
                  ]}
                  sx={{
                    '& .MuiLineElement-root': {
                      strokeWidth: 2,
                    },
                    '& .MuiMarkElement-root': {
                      stroke: filtro === 'lenta' ? '#FFA726' : '#4FC3F7',
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
                  <Typography variant="body2" color="text.secondary">
                    {t('noHayRegistrosGraficar')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, my: 3 }}>
              {t('historialRegistros')}
            </Typography>

            {/* Tabla de Registros de Insulina */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, border: 'none' }}>
              <Table size="small" aria-label="tabla de insulina">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('hora')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('dosis')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tipo')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('zona')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('contexto')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insulinaFiltrada
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.hora}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {row.dosis}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: obtenerColorTipo(row.tipo) }}>
                          {row.tipo}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.zona}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.contexto}</TableCell>
                      </TableRow>
                  ))}
                  {insulinaFiltrada.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                        {t('noHayRegistrosFiltro')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[4, 10, 25]}
              component="div"
              count={insulinaFiltrada.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage={t('filasPorPagina')}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}