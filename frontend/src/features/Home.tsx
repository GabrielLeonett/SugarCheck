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

  const { t } = useLanguage("home");

  const [openGlucosaModal, setOpenGlucosaModal] = useState(false);

  const handleOpenGlucosaModal = () => {
    setOpenGlucosaModal(true);
  };

  const handleCloseGlucosaModal = () => {
    setOpenGlucosaModal(false);
  };

  const handleSaveGlucosaModal = () => {
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
      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 2, sm: 3 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          my: { xs: 4, md: 10 },
          gap: { xs: 2, sm: 4 }
        }}>
          <Typography variant='h4' component={'h4'} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
            {t("welcomeMessage").replace("{name}", user?.username || "")}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 4 }, justifyContent: 'center' }}>
            <ButtonBase onClick={handleOpenGlucosaModal} startIcon={<AddIcon />}>{t("actions.registerGlucose")}</ButtonBase>
            <ButtonBase startIcon={<AddIcon />}>{t("actions.applyInsulin")}</ButtonBase>
            <ButtonBase startIcon={<AddIcon />}>{t("actions.registerWeight")}</ButtonBase>
          </Box>
        </Box>

        <ModalGlucosaForm
          open={openGlucosaModal}
          onClose={handleCloseGlucosaModal}
          onSave={handleSaveGlucosaModal}
        />

        <Grid container spacing={4} sx={{ mt: 5 }}>
          {/* Tarjeta: Última Batalla */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 },
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                {t("cards.lastBattle.title")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Typography variant='h1' component='h1' sx={{ color: '#4CAF50', fontWeight: 'bold', fontSize: { xs: '3.5rem', sm: '5rem' } }}>
                  120
                </Typography>
                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ArrowDropUpIcon sx={{ color: '#4CAF50', fontSize: { xs: '2rem', sm: '3rem' }, mb: -1 }} />
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 },
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                {t("cards.securityTimer.title")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
                <Typography variant='subtitle1' component='p' sx={{ width: '5rem', textAlign: 'center', color: '#666', fontSize: '0.85rem', lineHeight: 2 }}>
                  {t("cards.securityTimer.description")}
                </Typography>
                <Typography variant='h3' component='h3' sx={{ color: '#FF9800', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '3rem' } }}>
                  3h : 45m
                </Typography>
              </Box>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#FF9800', fontWeight: 'medium' }}>
                {t("cards.securityTimer.alertMessage")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Tarjeta: Dominio de la Zona Segura */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 },
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                {t("cards.safeZone.title")}
              </Typography>
              <Typography variant='h1' component='h1' sx={{ color: '#FF5252', fontWeight: 'bold', fontSize: { xs: '3.5rem', sm: '5rem' }, mb: 2 }}>
                45%
              </Typography>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#FF5252', fontWeight: 'medium' }}>
                {t("cards.safeZone.alertMessage")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Historial de Batallas (Gráfico) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <CardBase sx={{
              height: '100%',
              p: 3,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                {t("cards.battleHistory.title")}
              </Typography>

              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <LineChart
                  xAxis={[{
                    data: ObtenerDiasOrdenados(),
                    scaleType: 'band'
                  }]}
                  yAxis={[{
                    min: 50,
                    max: 500,
                  }]}
                  series={[
                    {
                      data: [110, 135, 210, 230, 115, 100, 240],
                      color: '#5B9BD5',
                      showMark: true,
                    },
                  ]}
                  height={500}
                  margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                />
              </Box>
            </CardBase>
          </Grid>

          {/* Tarjeta: Balance de Fortaleza Física */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CardBase sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 },
              textAlign: 'center'
            }}>
              <Typography variant='h5' component='h5' sx={{ color: '#7692A8', fontWeight: 'bold', mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                {t("cards.physicalBalance.title")}
              </Typography>

              <Typography variant='h1' component='h1' sx={{ color: '#5A5A5A', fontWeight: 'bold', fontSize: { xs: '3.5rem', sm: '5rem' }, my: 1 }}>
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
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                    {t("cards.physicalBalance.statusUnderweight")}
                  </Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                    {t("cards.physicalBalance.statusNormal")}
                  </Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'right' }}>
                  <Typography variant='caption' sx={{ color: '#666', fontWeight: 'bold', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
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