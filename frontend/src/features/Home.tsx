import { Box, Grid, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import Footer from '../components/layout/Footer/Footer.tsx';
import Navbar from '../components/layout/Header/Navbar.tsx';
import { useAuthStore } from '../stores/authStore.tsx';
import { ButtonBase } from '../components/ui/Buttons/ButtonBase.tsx';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { LineChart } from '@mui/x-charts/LineChart';
import { CardBase } from '../components/ui/Cards/CardBase.tsx';
import useLanguage from '../hooks/useLanguage.tsx';
import ModalGlucosaForm from '../components/shared/ModalGlucosaForm.tsx';

const MAX = 100;
const MIN = 0;

export default function Home() {
  const user = useAuthStore((state) => state.user);

  // Inicializamos el hook con el namespace 'home'
  const { t } = useLanguage("home");

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

  const [openGlucosaModal, setOpenGlucosaModal] = useState(false);
  const [nivelGlucosa, setNivelGlucosa] = useState('');
  const [contextoGlucosa, setContextoGlucosa] = useState('');
  const [fechaGlucosa, setFechaGlucosa] = useState(obtenerFechaActual());
  const [horaGlucosa, setHoraGlucosa] = useState(obtenerHoraActual());

  const handleOpenGlucosaModal = () => {
    setFechaGlucosa(obtenerFechaActual());
    setHoraGlucosa(obtenerHoraActual());
    setOpenGlucosaModal(true);
  };

  const handleCloseGlucosaModal = () => {
    setOpenGlucosaModal(false);
  };

  const handleSaveGlucosaModal = () => {
    // Aquí puedes hacer la lógica para guardar el registro.
    setOpenGlucosaModal(false);
  };

  // Reconstruimos el array de días usando las llaves del JSON
  const Dias = [
    t("days.monday"),
    t("days.tuesday"),
    t("days.wednesday"),
    t("days.thursday"),
    t("days.friday"),
    t("days.saturday"),
    t("days.sunday")
  ];

  const ObtenerDiasOrdenados = () => {
    const hoy = new Date().getDay();
    // Ajuste por si el domingo en JS es 0 para acoplarlo al array que empieza en Lunes (1)
    const indiceActual = hoy === 0 ? 6 : hoy - 1;
    return [...Dias.slice(indiceActual), ...Dias.slice(0, indiceActual)];
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mx: 7, my: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'center',
          my: 10
        }}>
          <Typography variant='h4' component={'h4'}>
            {t("welcomeMessage").replace("{name}", user?.name.split(' ')[0] || "")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <ButtonBase onClick={handleOpenGlucosaModal} startIcon={<AddIcon />}>{t("actions.registerGlucose")}</ButtonBase>
            <ButtonBase startIcon={<AddIcon />}>{t("actions.applyInsulin")}</ButtonBase>
            <ButtonBase startIcon={<AddIcon />}>{t("actions.registerWeight")}</ButtonBase>
          </Box>
        </Box>

        <ModalGlucosaForm
          open={openGlucosaModal}
          onClose={handleCloseGlucosaModal}
          nivelGlucosa={nivelGlucosa}
          onNivelGlucosaChange={setNivelGlucosa}
          contexto={contextoGlucosa}
          onContextoChange={setContextoGlucosa}
          fecha={fechaGlucosa}
          onFechaChange={setFechaGlucosa}
          hora={horaGlucosa}
          onHoraChange={setHoraGlucosa}
          onSave={handleSaveGlucosaModal}
        />

        <Grid container spacing={4} sx={{ mt: 5 }}>
          {/* Tarjeta: Última Batalla */}
          <Grid size={4}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2 }}>
                {t("cards.lastBattle.title")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Typography variant='h1' component='h1' sx={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '5rem' }}>
                  120
                </Typography>
                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ArrowDropUpIcon sx={{ color: '#4CAF50', fontSize: '3rem', mb: -1 }} />
                  <Typography variant='subtitle1' component='span' sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {t("cards.lastBattle.unit")}
                  </Typography>
                </Box>
              </Box>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#4CAF50', fontWeight: 'medium' }}>
                {t("cards.lastBattle.timeLabel").replace("{time}", "25 min")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Tarjeta: Cronómetro de Seguridad */}
          <Grid size={4}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2 }}>
                {t("cards.securityTimer.title")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
                <Typography variant='subtitle1' component='p' sx={{ width: '5rem', textAlign: 'center', color: '#666', fontSize: '0.85rem', lineHeight: 2 }}>
                  {t("cards.securityTimer.description")}
                </Typography>
                <Typography variant='h3' component='h3' sx={{ color: '#FF9800', fontWeight: 'bold', fontSize: '3rem' }}>
                  3h : 45m
                </Typography>
              </Box>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#FF9800', fontWeight: 'medium' }}>
                {t("cards.securityTimer.alertMessage")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Tarjeta: Dominio de la Zona Segura */}
          <Grid size={4}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2 }}>
                {t("cards.safeZone.title")}
              </Typography>
              <Typography variant='h1' component='h1' sx={{ color: '#FF5252', fontWeight: 'bold', fontSize: '5rem', mb: 2 }}>
                45%
              </Typography>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#FF5252', fontWeight: 'medium' }}>
                {t("cards.safeZone.alertMessage")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Historial de Batallas (Gráfico) */}
          <Grid size={8}>
            <CardBase sx={{
              height: '100%',
              p: 3,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                {t("cards.battleHistory.title")}
              </Typography>

              <Box sx={{ width: '100%', height: 'fit-content' }}>
                <LineChart
                  xAxis={[{
                    data: ObtenerDiasOrdenados(),
                    scaleType: 'band'
                  }]}
                  yAxis={[{
                    min: 50,
                    max: 200,
                  }]}
                  series={[
                    {
                      data: [110, 135, 210, 230, 115, 100, 240],
                      color: '#5B9BD5',
                      showMark: true,
                    },
                  ]}
                  height={200}
                  margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                />
              </Box>
            </CardBase>
          </Grid>

          {/* Tarjeta: Balance de Fortaleza Física */}
          <Grid size={4}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2 }}>
                {t("cards.physicalBalance.title")}
              </Typography>

              <Typography variant='h1' component='h1' sx={{ color: '#5A5A5A', fontWeight: 'bold', fontSize: '5rem', my: 1 }}>
                21.1
              </Typography>

              <Typography variant='subtitle2' component='aside' sx={{ color: '#4CAF50', fontWeight: 'medium', mb: 3 }}>
                {t("cards.physicalBalance.statusHealthy")}
              </Typography>

              <Slider
                value={21.1}
                min={MIN}
                max={MAX}
                disabled
                sx={{
                  width: '90%',
                  mb: 1,
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#7692A8',
                    width: 14,
                    height: 14,
                  },
                  '& .MuiSlider-rail': {
                    opacity: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundImage: 'linear-gradient(90deg, #0088FF 0%, #4CAF50 50%, #FB8C00 100%)'
                  },
                  '& .MuiSlider-track': {
                    display: 'none'
                  }
                }}
              />

              <Grid container sx={{ width: '90%', mt: 1 }}>
                <Grid size={4} sx={{ textAlign: 'left' }}>
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold' }}>
                    {t("cards.physicalBalance.statusUnderweight")}
                  </Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold' }}>
                    {t("cards.physicalBalance.statusNormal")}
                  </Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'right' }}>
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold' }}>
                    {t("cards.physicalBalance.statusOverweight")}
                  </Typography>
                </Grid>
              </Grid>
            </CardBase>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </>
  );
}