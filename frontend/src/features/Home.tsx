import { Box, Typography } from '@mui/material';
import Footer from '../components/layout/Footer/Footer.tsx';
import Navbar from '../components/layout/Header/Navbar.tsx';
import { useAuthStore } from '../stores/authStore.tsx';
import { ButtonBase } from '../components/ui/Buttons/ButtonBase.tsx';
import AddIcon from '@mui/icons-material/Add';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  return (<>
    <Navbar />
    <Box>
      <Box sx={{
        mx: 7,
        my: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignContent: 'center',
      }}>
        <Typography variant='h2' component={'h2'}>
          Hola, Guerrero {user?.name}
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
      
    </Box >
    <Footer />
  </>
  );
}
