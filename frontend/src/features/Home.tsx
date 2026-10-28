import { Box, Grid, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import Footer from '../components/layout/Footer/Footer.tsx';
import Navbar from '../components/layout/Header/Navbar.tsx';
import { useAuthStore } from '../stores/authStore.tsx';
import { ButtonBase } from '../components/ui/Buttons/ButtonBase.tsx';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { GraficoBarra } from '../components/shared/GraficoBarra.tsx';
import { CardBase } from '../components/ui/Cards/CardBase.tsx';
import useLanguage from '../hooks/useLanguage.tsx';
import { useGlucosaData } from '../hooks/useGlucosaData.tsx';
import { useImcData } from '../hooks/useImcData.ts';
import ModalGlucosaForm from '../components/shared/ModalGlucosaForm.tsx';
import ModalImcForm from '../components/shared/ModalImcForm.tsx';
import ModalInsulinaRapida from './Insulina/components/ModalInsulinaRapida.tsx';
import { insulinaApi } from '../apis/insulina';
import { formToCreateGlucoseDto } from '../schemas/glucosa';
import type { GlucosaData } from '../schemas/glucosa';
import { useUiStore } from '../stores/uiStore';

const MAX = 100;
const MIN = 0;

export default function Home() {
  const user = useAuthStore((state) => state.user);

  const { t } = useLanguage("home");
  const showToast = useUiStore((s) => s.showToast);

  const [openGlucosaModal, setOpenGlucosaModal] = useState(false);
  const [openInsulinaModal, setOpenInsulinaModal] = useState(false);
  const [openImcModal, setOpenImcModal] = useState(false);

  const dataGlucosa = useGlucosaData();
  const dataImc = useImcData();

  const handleOpenGlucosaModal = () => setOpenGlucosaModal(true);
  const handleCloseGlucosaModal = () => setOpenGlucosaModal(false);
  const handleSaveGlucosaModal = (data: GlucosaData) =>
    dataGlucosa.handleSaveGlucosa(formToCreateGlucoseDto(data));

  const handleOpenInsulinaModal = () => setOpenInsulinaModal(true);
  const handleCloseInsulinaModal = () => setOpenInsulinaModal(false);

  const handleSaveInsulina = async (data: {
    dosis: number; contexto: string; dia: number; mes: number; anio: number; hora: string; zona: string;
  }) => {
    await insulinaApi.create({ tipo: 'RAPIDA', ...data });
    setOpenInsulinaModal(false);
    showToast('success', t('insulinSaved'), t('insulinSavedTitle'));
  };

  const handleOpenImcModal = () => setOpenImcModal(true);
  const handleCloseImcModal = () => setOpenImcModal(false);

  const handleSaveImc = (data: { peso: number; altura: number; fecha: string }) =>
    dataImc.handleSave(data);

  const ultimoRegistro = dataGlucosa.glucosaFiltrada[dataGlucosa.glucosaFiltrada.length - 1];
  const ultimaLectura = ultimoRegistro?.nivel ?? null;
  const porcentajeZonaSegura = dataGlucosa.porcentajeZonaSegura;

  const ultimoImc = dataImc.ultimoImc;
  const ultimaCategoria = dataImc.ultimaCategoria;

  const categoriaImcLabel =
    ultimaCategoria === 'Normal' ? t('cards.physicalBalance.statusNormal') :
    ultimaCategoria === 'Bajo peso' ? t('cards.physicalBalance.statusUnderweight') :
    ultimaCategoria === 'Sobrepeso' ? t('cards.physicalBalance.statusOverweight') :
    t('cards.physicalBalance.statusNormal');

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
            <ButtonBase onClick={handleOpenInsulinaModal} startIcon={<AddIcon />}>{t("actions.applyInsulin")}</ButtonBase>
            <ButtonBase onClick={handleOpenImcModal} startIcon={<AddIcon />}>{t("actions.registerWeight")}</ButtonBase>
          </Box>
        </Box>

        <ModalGlucosaForm
          open={openGlucosaModal}
          onClose={handleCloseGlucosaModal}
          onSave={handleSaveGlucosaModal}
        />

        <ModalInsulinaRapida
          open={openInsulinaModal}
          onClose={handleCloseInsulinaModal}
          onSave={handleSaveInsulina}
        />

        <ModalImcForm
          open={openImcModal}
          onClose={handleCloseImcModal}
          onSave={handleSaveImc}
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
                  {ultimaLectura ?? '--'}
                </Typography>
                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ArrowDropUpIcon sx={{ color: '#4CAF50', fontSize: { xs: '2rem', sm: '3rem' }, mb: -1 }} />
                  <Typography variant='subtitle1' component='span' sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {t("cards.lastBattle.unit")}
                  </Typography>
                </Box>
              </Box>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#4CAF50', fontWeight: 'medium' }}>
                {ultimoRegistro?.hora ?? t('cards.lastBattle.noReadings')}
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
                {porcentajeZonaSegura}%
              </Typography>
              <Typography variant='subtitle2' component='aside' sx={{ color: '#FF5252', fontWeight: 'medium' }}>
                {t("cards.safeZone.alertMessage")}
              </Typography>
            </CardBase>
          </Grid>

          {/* Balance de Fortaleza Física */}
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
                {ultimoImc !== null ? ultimoImc.toFixed(1) : '--'}
              </Typography>

              <Typography variant='subtitle2' component='aside' sx={{ color: ultimaCategoria === 'Normal' ? '#4CAF50' : '#FF5252', fontWeight: 'medium', mb: 3 }}>
                {ultimaCategoria ? categoriaImcLabel : t('cards.physicalBalance.noReadings')}
              </Typography>

              <Slider
                value={Math.min(ultimoImc ?? 0, MAX)}
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

              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
                <GraficoBarra
                  data={dataGlucosa.nivelesGlucosa}
                  labels={dataGlucosa.horasGlucosa}
                  color="#94c2e6"
                  label={t("cards.battleHistory.serieLabel")}
                  emptyMessage={t("cards.battleHistory.empty")}
                />
              </Box>
            </CardBase>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </>
  );
}