import AddIcon from '@mui/icons-material/Add';
import { 
  Box, Typography, Grid, Modal, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TablePagination, ButtonGroup 
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase.tsx';
import { CardBase } from '../../../components/ui/Cards/CardBase.tsx';
import { obtenerColorEstado } from '../../../hooks/useGlucosaData.tsx';

interface SeccionHbA1cProps {
  dataHook: any;
  onSaveHbA1c: () => void;
}

export function SeccionHbA1c({ dataHook, onSaveHbA1c }: SeccionHbA1cProps) {
  return (
    <Box component="section" sx={{ mb: 6 }}>
      <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
        Historial de Hemoglobina Glicosilada (HbA1c)
      </Typography>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Métricas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ButtonBase onClick={dataHook.handleOpenHbA1c} startIcon={<AddIcon />}> 
              Registrar Resultado de Laboratorio
            </ButtonBase>

            {/* MODAL DE HEMOGLOBINA GLICOSILADA (MANTENIDO LOCAL EN LA SECCIÓN) */}
            <Modal open={dataHook.openHbA1c} onClose={dataHook.handleCloseHbA1c} aria-labelledby="modal-hba1c-title">
              <Box sx={{ 
                display: "flex", flexDirection: "column", alignItems: "stretch", 
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)', width: 450, 
                bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 
              }}>
                <Typography id="modal-hba1c-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  Registrar Resultado HbA1c
                </Typography>

                <TextField 
                  fullWidth 
                  margin="normal" 
                  id="hba1c-level" 
                  label="Resultado del Laboratorio (%)" 
                  type="number" 
                  value={dataHook.resultadoHbA1cInput}
                  onChange={(e) => dataHook.setResultadoHbA1cInput(e.target.value)}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Fecha del Análisis"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={dataHook.fechaHbA1c}
                  onChange={(e) => dataHook.setFechaHbA1c(e.target.value)} 
                />

                <Button onClick={onSaveHbA1c} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
                Evolución de HbA1c
              </Typography>
              <ButtonGroup variant="outlined" size="small" aria-label="Filtros de hba1c">
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('trimestre'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'trimestre' ? 'contained' : 'outlined'}
                >
                  Trimestre
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('año'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'año' ? 'contained' : 'outlined'}
                >
                  Año
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('todos'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'todos' ? 'contained' : 'outlined'}
                >
                  Todos
                </Button>
              </ButtonGroup>
            </Box>
            
            <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {dataHook.resultadosHbA1c.length > 0 ? (
                <LineChart
                  xAxis={[{ scaleType: 'point', data: dataHook.fechasHbA1c }]}
                  series={[{ data: dataHook.resultadosHbA1c, label: 'Resultado (%)', color: '#81c784', curve: 'catmullRom' }]}
                  sx={{
                    '& .MuiLineElement-root': { strokeWidth: 2 },
                    '& .MuiMarkElement-root': { stroke: '#81c784', strokeWidth: 2, fill: '#ffffff', scale: '1.1' }
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
                  {[...dataHook.hbA1cFiltrada].reverse()
                    .slice(dataHook.pageHbA1c * dataHook.rowsPerPageHbA1c, dataHook.pageHbA1c * dataHook.rowsPerPageHbA1c + dataHook.rowsPerPageHbA1c)
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
                  {dataHook.hbA1cFiltrada.length === 0 && (
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
              count={dataHook.hbA1cFiltrada.length}
              rowsPerPage={dataHook.rowsPerPageHbA1c}
              page={dataHook.pageHbA1c}
              onPageChange={(_, newPage) => dataHook.setPageHbA1c(newPage)}
              onRowsPerPageChange={(e) => {
                dataHook.setRowsPerPageHbA1c(parseInt(e.target.value, 10));
                dataHook.setPageHbA1c(0);
              }}
              labelRowsPerPage="Filas por páginas:"
            />
          </CardBase>
        </Grid>
      </Grid>
    </Box>
  );
}