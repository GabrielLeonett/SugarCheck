import AddIcon from '@mui/icons-material/Add';
import { 
  Box, Typography, Grid, LinearProgress, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TablePagination, Button, ButtonGroup 
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase.tsx';
import { CardBase } from '../../../components/ui/Cards/CardBase.tsx';
import ModalGlucosaForm from '../../../components/shared/ModalGlucosaForm.tsx';
import { obtenerColorEstado } from '../../../hooks/useGlucosaData.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';

interface SeccionGlucemiaProps {
  dataHook: any; // Tipar de acuerdo a tu retorno de useGlucosaData si es necesario
  onSaveGlucosa: () => void;
}

export function SeccionGlucemia({ dataHook, onSaveGlucosa }: SeccionGlucemiaProps) {
  const { t } = useLanguage("glucemia");

  return (
    <Box component="section" sx={{ mb: 6 }}>
      <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
        {t('titleMonitoreo')}
      </Typography>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Métricas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ButtonBase onClick={dataHook.handleOpenGlucosa} startIcon={<AddIcon />}> 
              {t('btnRegistrar')}
            </ButtonBase>

            {/* MODAL DE GLUCOSA COMPARTIDO */}
            <ModalGlucosaForm 
              open={dataHook.openGlucosa}
              onClose={dataHook.handleCloseGlucosa}
              nivelGlucosa={dataHook.nivelGlucosaInput}
              onNivelGlucosaChange={dataHook.setNivelGlucosaInput}
              contexto={dataHook.contexto}
              onContextoChange={dataHook.setContexto}
              fecha={dataHook.fechaGlucosa}
              onFechaChange={dataHook.setFechaGlucosa}
              hora={dataHook.hora}
              onHoraChange={dataHook.setHora}
              onSave={onSaveGlucosa}
            />

            {/* Dominio de la Zona Segura */}
            <CardBase sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('zonaSegura.title')}
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, color: "error.light" }}>
                {dataHook.porcentajeZonaSegura !== undefined ? `${dataHook.porcentajeZonaSegura}%` : "45%"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('zonaSegura.caption')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, color: "error.light" }}>
                {/* Lógica condicional dinámica basada en los rangos clínicos */}
                {dataHook.porcentajeZonaSegura < 50 ? t('zonaSegura.alertaBaja') : t('zonaSegura.alertaNormal')}
              </Typography>
            </CardBase>
            
            {/* Frecuencia de Alertas */}
            <CardBase sx={{ display: "flex", flexDirection: "column", p: 3, width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center", mb: 3, color: "text.primary" }}>
                {t('frecuenciaAlertas.title')}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.hiperglucemias')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={70} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'warning.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(70% - 20px)', color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantHiperglucemias || 4}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.hipoglucemias')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={30} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'info.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(30% - 20px)', color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantHipoglucemias || 1}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Typography variant="body2" sx={{ width: 140, color: "text.primary", fontWeight: 500 }}>
                    {t('frecuenciaAlertas.enRango')}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress variant="determinate" value={85} sx={{ width: '100%', height: 24, borderRadius: 3, bgcolor: '#4A6375', '& .MuiLinearProgress-bar': { bgcolor: 'success.light', borderRadius: 3 } }} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: 'calc(85% - 20px)', color: '#fff', fontWeight: 700 }}>
                      {dataHook.cantEnRango || 9}
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
                {t('grafico.title')}
              </Typography>
              <ButtonGroup variant="outlined" size="small" aria-label="Filtros de glucosa">
                <Button 
                  onClick={() => { dataHook.setFiltroGlucosa('hoy'); dataHook.setPageGlucosa(0); }}
                  variant={dataHook.filtroGlucosa === 'hoy' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.hoy')}
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroGlucosa('semana'); dataHook.setPageGlucosa(0); }}
                  variant={dataHook.filtroGlucosa === 'semana' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.semana')}
                </Button>
                <Button 
                  onClick={() => { dataHook.setFiltroGlucosa('mes'); dataHook.setPageGlucosa(0); }}
                  variant={dataHook.filtroGlucosa === 'mes' ? 'contained' : 'outlined'}
                >
                  {t('grafico.filtros.mes')}
                </Button>
              </ButtonGroup>
            </Box>
            
            <Box sx={{ flexGrow: 1, width: '100%', height: 220, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {dataHook.nivelesGlucosa.length > 0 ? (
                <LineChart
                  xAxis={[{ scaleType: 'point', data: dataHook.horasGlucosa }]}
                  series={[{ data: dataHook.nivelesGlucosa, label: t('grafico.labelSerie'), color: '#94c2e6', curve: 'catmullRom' }]}
                  sx={{
                    '& .MuiLineElement-root': { strokeWidth: 2 },
                    '& .MuiMarkElement-root': { stroke: '#94c2e6', strokeWidth: 2, fill: '#ffffff', scale: '1.1' }
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
              <Table size="small" aria-label="tabla de glucosa">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.hora')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.nivel')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.contexto')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{t('tabla.headers.estado')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...dataHook.glucosaFiltrada].reverse()
                    .slice(dataHook.pageGlucosa * dataHook.rowsPerPageGlucosa, dataHook.pageGlucosa * dataHook.rowsPerPageGlucosa + dataHook.rowsPerPageGlucosa)
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
                  {dataHook.glucosaFiltrada.length === 0 && (
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
              count={dataHook.glucosaFiltrada.length}
              rowsPerPage={dataHook.rowsPerPageGlucosa}
              page={dataHook.pageGlucosa}
              onPageChange={(_, newPage) => dataHook.setPageGlucosa(newPage)}
              onRowsPerPageChange={(e) => {
                dataHook.setRowsPerPageGlucosa(parseInt(e.target.value, 10));
                dataHook.setPageGlucosa(0);
              }}
              labelRowsPerPage={t('tabla.paginacion.filasPorPagina')}
            />
          </CardBase>
        </Grid>
      </Grid>
    </Box>
  );
}