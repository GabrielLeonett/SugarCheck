import { Card, Typography } from "@mui/material";
import Footer from "../components/layout/Footer/Footer.tsx";
import Navbar from "../components/layout/Header/Navbar.tsx";

export default function Home() {
  return (
    <>
      <Navbar />
      <Card elevation={3} sx={{p:2,m:4}}>
        <Typography variant="h4">Bienvenido a SugarCheck</Typography>
      </Card>
      <Footer />
    </>
  );
}
