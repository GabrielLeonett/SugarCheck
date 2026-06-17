import Navbar from "../components/layout/Header/Navbar.tsx";
import {Typography,Button, Card } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

export default function Insulina() {
  
  return (
    <>
      <Navbar />
      <Typography 
      sx={{ textAlign: "center" }}
      variant="h4">
        Registro de insulina
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />}>
        Registrar Aplicación de Dosis Rápida
      </Button>
      <Button  sx={{ }} variant="contained" startIcon={<AddIcon />}>
        Registrar Aplicación de Dosis Lenta
      </Button>

      <Card>
        <Typography variant="h5" component="div">
          Cronometro de Seguridad
        </Typography>
        
      </Card>

    </>
  );
}
