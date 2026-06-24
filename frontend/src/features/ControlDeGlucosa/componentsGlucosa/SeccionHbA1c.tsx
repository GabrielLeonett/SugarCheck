import AddIcon from '@mui/icons-material/Add';
import { 
  Box, Typography, Grid, Modal, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TablePagination, ButtonGroup 
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase.tsx';
import { CardBase } from '../../../components/ui/Cards/CardBase.tsx';
import { obtenerColorEstado } from '../../../hooks/useGlucosaData.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';

interface SeccionHbA1cProps {
  dataHook: any;
  onSaveHbA1c: () => void;
}

export function SeccionHbA1c({ dataHook, onSaveHbA1c }: SeccionHbA1cProps) {
  const { t } = useLanguage("glicosilada");

  return (
    <Box component="section" sx={{ mb: 6 }}>
      <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
        {t('titleHistorial')}
      </Typography>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Métricas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ButtonBase onClick={dataHook.handleOpenHbA1c} startIcon={<AddIcon />}> 
              {t('btnRegistrar')}
            </ButtonBase>

            {/* MODAL DE HEMOGLOBINA GLICOSILADA */}
            <Modal open={dataHook.openHbA1c} onClose={dataHook.handleCloseHbA1c} aria-labelledby="modal-hba1c-title">
              <Box sx={{ 
                display: "flex", flexDirection: "column", alignItems: "stretch", 
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)', width: 450, 
                bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 
              }}>
                <Typography id="modal-hba1c-title" variant="h6" component="h2" color="primary.dark" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  {t('modal.title')}
                </Typography>

                <TextField 
                  fullWidth 
                  margin="normal" 
                  id="hba1c-level" 
                  label={t('modal.labelResultado')} 
                  type="number" 
                  value={dataHook.resultadoHbA1cInput}
                  onChange={(e) => dataHook.setResultadoHbA1cInput(e.target.value)}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label={t('modal.labelFecha')}
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={dataHook.fechaHbA1c}
                  onChange={(e) => dataHook.setFechaHbA1c(e.target.value)} 
                />

                <Button onClick={onSaveHbA1c} sx={{ mt: 3, py: 1 }} variant="contained" color="primary" fullWidth>
                  {t('modal.btnGuardar')}
                </Button>
              </Box>
            </Modal>

            {/* Último Resultado */}
            <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('ultimoResultado.title')}
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: "success.light" }}>
                {/* Supongo que este valor vendrá de tu hook en un entorno real, por ahora dejo el estático formateado */}
                {dataHook.ultimoResultadoHbA1c ? `${dataHook.ultimoResultadoHbA1c}%` : "6.8%"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {/* Interpolación dinámica del eAG estimado */}
                {t('ultimoResultado.estimado', { valor: dataHook.ultimoEag || 148 })}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: "success.light" }}>
                {/* Ejemplo de condicional dinámico usando las claves de traducción */}
                {dataHook.enRangoObjetivo !== false ? t('ultimoResultado.enRango') : t('ultimoResultado.fueraRango')}
              </Typography>
            </CardBase>
          </Box>
        </Grid>

        {/* Columna Derecha: Gráfico HbA1c e Historial */}
        <Grid size={{ xs: 12, md: 7 }}>
          <CardBase sx={{ display: 'flex', flexDirection: 'column', minHeight: 560, height: '100%', p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
                {t('grafico.title')}
              </Typography>
              <ButtonGroup variant="outlined" size="small" aria-label="Filtros de hba1c">
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('trimestre'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'trimestre' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.trimestre')}
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('año'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'año' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.año')}
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroHbA1c('todos'); dataHook.setPageHbA1c(0); }}
                  variant={dataHook.filtroHbA1c === 'todos' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.todos')}
                </Button>
              </ButtonGroup>
            </Box>
            
            <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {dataHook.resultadosHbA1c.length > 0 ? (
                <LineChart
                  xAxis={[{ scaleType: 'point', data: dataHook.fechasHbA1c }]}
                  series={[{ data: dataHook.resultadosHbA1c, label: t('grafico.labelSerie'), color: '#81c784', curve: 'catmullRom' }]}
                  sx={{
                    '& .MuiLineElement-root': { strokeWidth: 2 },
                    '& .MuiMarkElement-root': { stroke: '#81c784', strokeWidth: 2, fill: '#ffffff', scale: '1.1' }
                  }}
                  height={220}
                  margin={{ top: 20, bottom: 30, left: 0, right: 40 }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{t('grafico.sinDatos')}</Typography>
                </Box>
              )}
            </Box>

            <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, my: 3 }}>
              {t('tabla.title')}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, border: 'none' }}>
              <Table size="small" aria-label="tabla de hba1c">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.fecha')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.resultado')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.estimado')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.estado')}</TableCell>
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
                        {t('tabla.sinDatos')}
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
              labelRowsPerPage={t('tabla.paginacion.filasPorPagina')}
            />
          </CardBase>
        </Grid>
      </Grid>
    </Box>
  );
}