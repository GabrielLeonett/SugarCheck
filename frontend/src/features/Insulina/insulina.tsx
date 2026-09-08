import Navbar from "../../components/layout/Header/Navbar.tsx";
import Footer from '../../components/layout/Footer/Footer.tsx';
import { Typography, Box, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { CardBase } from "../../components/ui/Cards/CardBase.tsx";
import { useState, useEffect, useCallback } from "react";
import { ButtonBase } from "../../components/ui/Buttons/ButtonBase.tsx";
import ModalInsulinaLenta from "./components/ModalInsulinaLenta.tsx";
import ModalInsulinaRapida from "./components/ModalInsulinaRapida.tsx";
import InsulinaHistorial from "./components/insulinaHistorial.tsx";
import useLanguage from "../../hooks/useLanguage";
import { insulinaApi, type DailyTotals } from "../../apis/insulina";

export default function Insulina() {
  const [openLento, setOpenLento] = useState(false);
  const [openRapido, setOpenRapido] = useState(false);
  const [totals, setTotals] = useState<DailyTotals>({ totalRapida: 0, totalLenta: 0, totalGeneral: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { t } = useLanguage('insulina');

  const Rango = ["80 - 120", "121 - 150", "151 - 190", "191 - 250", "> 250"];
  const unidadesE = ["2 UI", "3 UI", "4 UI", "5 UI", "6 UI"];

  const loadTotals = useCallback(async () => {
    try {
      const data = await insulinaApi.getTotals();
      setTotals(data);
    } catch {
      console.error("Error al cargar totales de insulina");
    }
  }, []);

  useEffect(() => {
    loadTotals();
  }, [loadTotals, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(k => k + 1);
  }, []);

  const handleGuardarRapida = async (data: {
    dosis: number;
    contexto: string;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
  }) => {
    try {
      await insulinaApi.create({
        tipo: 'RAPIDA',
        ...data,
      });
      setOpenRapido(false);
      handleRefresh();
    } catch (error) {
      console.error("Error al guardar insulina rápida:", error);
      throw error;
    }
  };

  const handleGuardarLenta = async (data: {
    dosis: number;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
  }) => {
    try {
      await insulinaApi.create({
        tipo: 'LENTA',
        ...data,
      });
      setOpenLento(false);
      handleRefresh();
    } catch (error) {
      console.error("Error al guardar insulina lenta:", error);
      throw error;
    }
  };

  return (
    <>
      <Navbar />

      <Box sx={{ mx: { xs: 2, sm: 7 }, my: { xs: 4, sm: 10 }, minHeight: 'calc(100vh - 130px)' }}>
        <Box sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {/* TÍTULO */}
          <Grid container>
            <Grid size={12}>
              <Typography variant="h3" component="h2" color="primary.main" sx={{ fontWeight: 700, mb: 8, textAlign: "center" }}>
                {t('monitoreoDiarioDeInsulina')}
              </Typography>
            </Grid>
          </Grid>

          {/* CONTENEDOR PRINCIPAL CON 2 COLUMNAS */}
          <Grid container spacing={3}>
            {/* COLUMNA IZQUIERDA */}
            <Grid size={{ xs: 12, md: 5 }}>
              {/* BOTONES PARA ABRIR MODALES - UNO ENCIMA DEL OTRO */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 2,
                  width: "100%",
                }}
              >
                <ButtonBase
                  onClick={() => setOpenRapido(true)}
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ 
                    width: "100%",
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  {t("registrarRapida")} 
                </ButtonBase>

                <ButtonBase
                  onClick={() => setOpenLento(true)}
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ 
                    width: "100%",
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  {t("registrarLenta")}
                </ButtonBase>
              </Box>

              {/* CARD: CRONÓMETRO */}
              <CardBase sx={{ mb: 2, p: 2.5, textAlign: "center" }}>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                  {t("cronometroSeguridad")}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: "#f6983b", fontWeight: "bold", mb: 1 }}
                >
                  {totals.totalGeneral.toFixed(1)} UI
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                  {t("rapida")}: {totals.totalRapida.toFixed(1)} UI | {t("lenta")}: {totals.totalLenta.toFixed(1)} UI
                </Typography>
              </CardBase>

              {/* CARDS: UNIDADES TOTALES Y ESQUEMA CORRECTOR - UNA AL LADO DE LA OTRA */}
              <Grid container spacing={2}>
                {/* CARD: UNIDADES TOTALES DEL DÍA */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CardBase sx={{ p: 2.5, textAlign: "center", height: "100%" }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 0.75 }}>
                      {t("unidadesTotalesDia")}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ color: "#7AAFD7", fontWeight: "bold" }}
                    >
                      {totals.totalRapida.toFixed(1)} UI
                    </Typography>
                  </CardBase>
                </Grid>

                {/* CARD: ESQUEMA CORRECTOR */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CardBase sx={{ p: 2.5, textAlign: "center", height: "100%" }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {t("esquemaCorrector")}
                    </Typography>

                    {/* Tabla de esquema */}
                    <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}
                        >
                          {t("mgDl")}
                        </Typography>
                        {Rango.map((rango, index) => (
                          <Typography 
                            key={index} 
                            sx={{ 
                              py: 0.5, 
                              color: "#7AAFD7",
                              fontSize: '0.813rem'
                            }}
                          >
                            {rango}
                          </Typography>
                        ))}
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}
                        >
                          {t("uiBolus")}
                        </Typography>
                        {unidadesE.map((unidad, index) => (
                          <Typography 
                            key={index} 
                            sx={{ 
                              py: 0.5, 
                              color: "#7AAFD7",
                              fontSize: '0.813rem'
                            }}
                          >
                            {unidad}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </CardBase>
                </Grid>
              </Grid>
            </Grid>

            {/* COLUMNA DERECHA */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ width: '100%' }}>
                <InsulinaHistorial refreshTrigger={refreshTrigger} />
              </Box>
            </Grid>
          </Grid>

          {/* MODALES */}
          <ModalInsulinaRapida
            open={openRapido}
            onClose={() => {
              setOpenRapido(false);
            }}
            onSave={handleGuardarRapida}
          />

          <ModalInsulinaLenta
            open={openLento}
            onClose={() => {
              setOpenLento(false);
            }}
            onSave={handleGuardarLenta}
          />
        </Box>
      </Box>
      <Footer />
    </>
  );
}