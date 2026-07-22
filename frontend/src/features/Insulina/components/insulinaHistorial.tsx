import { useState, useMemo, useEffect, useCallback } from "react";
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
import { insulinaApi, type InsulinRecord } from "../../../apis/insulina";

interface InsulinaHistorialProps {
  refreshTrigger?: number;
}

export default function InsulinaHistorial({ refreshTrigger = 0 }: InsulinaHistorialProps) {
  const { t } = useLanguage('insulinaHistorial');
  
  const [registros, setRegistros] = useState<InsulinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'lenta' | 'rapida'>('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const loadRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const data = await insulinaApi.getAll();
      setRegistros(data);
    } catch {
      console.error("Error al cargar registros de insulina");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistros();
  }, [loadRegistros, refreshTrigger]);

  const obtenerColorTipo = (tipo: string) => {
    if (tipo === "LENTA") return 'warning.light';
    if (tipo === "RAPIDA") return 'info.light';
    return 'text.primary';
  };

  const obtenerTipoLabel = (tipo: string) => {
    return tipo === "LENTA" ? "Lenta / Basal" : "Rápida / Bolus";
  };

  const formatHora = (hora: string) => {
    const [h, m] = hora.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // Filtrar insulina según el tipo seleccionado
  const insulinaFiltrada = useMemo(() => {
    let filtrados = registros;
    
    if (filtro === 'lenta') {
      filtrados = registros.filter(item => item.tipo === 'LENTA');
    } else if (filtro === 'rapida') {
      filtrados = registros.filter(item => item.tipo === 'RAPIDA');
    }
    
    return [...filtrados].reverse();
  }, [filtro, registros]);

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
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando...
                </Typography>
              ) : insulinaFiltrada.length > 0 ? (
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
                        <TableCell sx={{ color: 'text.secondary' }}>{formatHora(row.hora)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {row.dosis} UI
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: obtenerColorTipo(row.tipo) }}>
                          {obtenerTipoLabel(row.tipo)}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.zonaLabel}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.contextoLabel || '-'}</TableCell>
                      </TableRow>
                  ))}
                  {!loading && insulinaFiltrada.length === 0 && (
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