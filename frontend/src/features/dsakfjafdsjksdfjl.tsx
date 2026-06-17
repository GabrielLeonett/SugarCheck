import { Box, Grid, Slider, Typography } from '@mui/material';
import Footer from '../components/layout/Footer/Footer.tsx';
import Navbar from '../components/layout/Header/Navbar.tsx';
import { useAuthStore } from '../stores/authStore.tsx';
import { ButtonBase } from '../components/ui/Buttons/ButtonBase.tsx';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { LineChart } from '@mui/x-charts/LineChart';
import { CardBase } from '../components/ui/Cards/fdhjasfdasdfalsk.tsx';

const MAX = 100;
const MIN = 0;
const marks = [
  {
    value: MIN,
    label: '',
  },
  {
    value: MAX,
    label: '',
  },
];

const Dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

export default function Home() {
  const user = useAuthStore((state) => state.user);

  const ObtenerDiasOrdenados = () => {
    const hoy = new Date().getDay();
    const indiceActual = hoy;
    return [...Dias.slice(indiceActual), ...Dias.slice(0, indiceActual)];
  }

  return (<>
    <Navbar />
    <Box sx={{
      mx: 7,
      my: 3,
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignContent: 'center',
        my: 10
      }}>
        <Typography variant='h3' component={'h3'}>
          !Hola, Guerrero {user?.name.split(' ')[0]}¡
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 4
        }}>

          <ButtonBase startIcon={<AddIcon />}> Registrar Glucosa</ButtonBase>
          <ButtonBase startIcon={<AddIcon />}> Aplicar Insulina</ButtonBase>
          <ButtonBase startIcon={<AddIcon />}> Registrar Peso/Talla</ButtonBase>

        </Box>
      </Box>
      <Grid container spacing={2} sx={{ mt: 5 }}>
        {/* FILA 1: TARJETAS SUPERIORES (Tamaño 4 cada una) */}
        <Grid size={4}>
          <CardBase sx={{
            height: '100%', // CORREGIDO: Ahora esta tarjeta también se estira al 100% de la fila
          }}>
            <Typography variant='h5' component={'h5'} sx={{ color: 'primary.main' }}>
              Última Batalla
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', my: 3 }}>
              <Typography variant='h1' component={'h1'} sx={{ color: 'success.light' }}>
                120
              </Typography>
              <Box sx={{ mx: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <ArrowDropUpIcon sx={{ color: 'success.light' }} />
                <Typography variant='subtitle1' component={'aside'} sx={{ color: 'success.light' }}>
                  mg/dL
                </Typography>
              </Box>
            </Box>
            <Typography variant='subtitle2' component={'aside'} sx={{ color: 'success.light' }}>
              Hace 25 min (Post-almuerzo)
            </Typography>
          </CardBase>
        </Grid>

        <Grid size={4}>
          <CardBase sx={{
            height: '100%',
          }}>
            <Typography variant='h5' component={'h5'} sx={{ color: 'primary.main' }}>
              Cronómetro de Seguridad
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', my: 3, gap: 2 }}>
              <Typography variant='subtitle1' component={'p'} sx={{ width: '2rem', textAlign: 'center', mr: 3 }}>
                Última Insulina Rápida
              </Typography>
              <Typography variant='h3' component={'h3'} sx={{ color: 'warning.main' }}>
                3h : 45m
              </Typography>
            </Box>
            <Typography variant='subtitle2' component={'aside'} sx={{ color: 'warning.light' }}>
              El escudo se está agotando
            </Typography>
          </CardBase>
        </Grid>

        <Grid size={4}>
          <CardBase sx={{
            height: '100%',
          }}>
            <Typography variant='h5' component={'h5'} sx={{ color: 'primary.main' }}>
              Dominio de la Zona Segura
            </Typography>
            <Typography variant='h1' component={'h1'} sx={{ color: 'error.light', my: 1.5 }}>
              45%
            </Typography>
            <Typography variant='subtitle2' component={'aside'} sx={{ color: 'error.light' }}>
              Niveles bajos. Revisa tus registros y actúa
            </Typography>
          </CardBase>
        </Grid>

        {/* FILA 2: HISTORIAL Y BALANCE (Tamaño 8 y 4) */}
        <Grid size={8}>
          <CardBase sx={{
            height: '100%',
            p: 2
          }}>
            <Typography variant='h5' component={'h5'} sx={{ color: 'primary.main', mb: 2 }}>
              Historial de Batallas
            </Typography>

            <LineChart
              xAxis={[{
                data: ObtenerDiasOrdenados(),
                scaleType: 'band'
              }]}
              yAxis={[{
                min: 0,
                max: 120,
              }]}
              series={[
                {
                  data: [90, 110, 120, 90, 97, 70, 115],
                  label: 'Glicemia'
                },
              ]}
              height={300}
              sx={{ width: '100%' }}
            />
          </CardBase>
        </Grid>

        <Grid size={4}>
          <CardBase sx={{
            height: '100%', // Mantiene la misma altura que el LineChart de al lado,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1.5
          }}>
            <Typography variant='h5' component='h5' sx={{ color: 'primary.main', textAlign: 'center' }}>
              Balance de Fortaleza Física
            </Typography>

            <Typography variant='h1' component='h1' sx={{ color: 'grey.light', fontWeight: 'bold' }}>
              21.1
            </Typography>

            <Typography variant='subtitle2' component='aside' sx={{ color: 'success.light' }}>
              Condición saludable
            </Typography>

            <Slider
              marks={marks}
              valueLabelDisplay="auto"
              min={MIN}
              max={MAX}
              sx={{
                width: '100%',
                my: 1
              }}
              slotProps={{
                rail: {
                  sx: {
                    opacity: 0.7,
                    height: 6,
                    backgroundImage: 'linear-gradient(90deg,rgba(0, 136, 255, 1) 0%, rgba(76, 175, 80, 1) 50%, rgba(251, 140, 0, 1) 100%)'
                  }
                },
                track: {
                  sx: { bgcolor: 'transparent' }
                }
              }}
            />

            <Grid container spacing={1} sx={{ width: '100%' }}>
              <Grid size={4}>
                <Typography variant='subtitle2' component='aside' sx={{ color: 'gray.light', textAlign: 'left' }}>
                  Bajo peso
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant='subtitle2' component='aside' sx={{ color: 'gray.light', textAlign: 'center' }}>
                  Normal
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant='subtitle2' component='aside' sx={{ color: 'gray.light', textAlign: 'right' }}>
                  Sobre peso
                </Typography>
              </Grid>
            </Grid>
          </CardBase>
        </Grid>
      </Grid>
    </Box >
    <Footer />
  </>
  );
}
