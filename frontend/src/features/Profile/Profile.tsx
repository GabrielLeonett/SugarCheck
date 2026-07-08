import React from "react";
import {
    Box,
    LinearProgress,
    Typography,
    Grid,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    MenuItem,
    IconButton,
    Divider,
    Switch,
    Paper,
    Modal
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { CardBase } from "../../components/ui/Cards/CardBase";
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AvatarProfile } from "./components/AvatarProfile";
import Medal from '../../assets/icons/medal.svg'
import { useAuthStore } from "../../stores/authStore";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { ButtonBase } from "../../components/ui/Buttons/ButtonBase";
import NumberSpinner from "../../components/ui/NumberSpinner";

export function Profile() {

    // El progreso actual de la barra según la imagen (25%)
    const [progress] = React.useState(25);
    const user = useAuthStore((state) => state.user)
    const [openConfirm, setOpenConfirm] = React.useState(false);

    return (
        <>
            <Navbar />

            {/* Contenedor Principal con un fondo gris claro y padding */}
            <Box sx={{ minHeight: "100vh", py: 4, px: 2 }}>
                <Grid container spacing={4} sx={{ mx: "auto", maxWidth: 'lg' }}>

                    {/* ================= COLUMNA IZQUIERDA: TARJETA DE PERFIL ================= */}
                    <Grid size={4}>
                        <CardBase elevation={4} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>

                            {/* Avatar y Nombre */}
                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <AvatarProfile />
                                <Typography variant="h6" sx={{ mt: 3 }}>
                                    Guerrero Nombre
                                </Typography>
                            </Box>

                            {/* Días en Racha */}
                            <Box sx={{ mb: 4, p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="#4A5568">
                                    Días en Racha
                                </Typography>
                                <Typography variant="h3" sx={{ my: 1, color: "success.light" }}>
                                    7
                                </Typography>
                                <Typography variant="caption" color="#718096">
                                    Días seguidos en la zona segura
                                </Typography>
                            </Box>

                            {/* La Ruta del Guerrero */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" align="center">
                                    La Ruta del Guerrero
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 0.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{ flexGrow: 1, height: 20, borderRadius: 5, bgcolor: 'primary.dark' }}
                                    />
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: "bold" }}>{progress}%</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2 }}>
                                    Nivel Actual
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 4 }}>
                                    Mundo 2 - Misión 8
                                </Typography>
                            </Box>

                            {/* Insignias Obtenidas */}
                            <Box sx={{ textAlign: "left" }}>
                                <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
                                    Insignias Obtenidas
                                </Typography>
                                <Box sx={{ bgcolor: 'primary.500', display: "flex", alignItems: "center", justifyContent: 'center', p: 1.5, borderRadius: 2, gap: 2 }}>
                                    {/* Aquí puedes usar un ícono hexagonal real o un Box con forma */}
                                    <Box component="img" src={Medal} alt="Medalla" sx={{ width: 50, height: 50 }} />
                                    <Box>
                                        <Typography variant="body2">Escudo de Fibra</Typography>
                                        <Typography variant="caption">Mundo 1</Typography>
                                    </Box>
                                </Box>
                            </Box>

                        </CardBase>
                    </Grid>

                    {/* ================= COLUMNA DERECHA: CONFIGURACIONES ================= */}
                    <Grid size={8}>
                        <Typography variant="h4" sx={{ my: 4 }}>
                            Perfil y Configuraciones
                        </Typography>

                        {/* ================= 1. ACORDEÓN: PERSONAL ================= */}
                        <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Personal</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Grid container spacing={3}>
                                    {/* Nombre */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Nombre</Typography>
                                        <TextField fullWidth placeholder={user?.name || ''} variant="outlined" sx={{ borderRadius: 1 }} />
                                    </Grid>
                                    {/* Fecha de Nacimiento */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Fecha de Nacimiento</Typography>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DateField fullWidth label="Fecha de Nacimiento" />
                                        </LocalizationProvider>

                                    </Grid>
                                    {/* Sexo */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Genero</Typography>
                                        <TextField select fullWidth defaultValue="">
                                            <MenuItem value="masculino">Masculino</MenuItem>
                                            <MenuItem value="femenino">Femenino</MenuItem>
                                            <MenuItem value="otro">Otro</MenuItem>
                                        </TextField>
                                    </Grid>
                                    {/* Correo Electrónico */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Correo Electrónico</Typography>
                                        <TextField fullWidth placeholder={user?.email || ''} />
                                    </Grid>
                                    {/* Contraseña Actual */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Contraseña Actual</Typography>
                                        <TextField fullWidth type="password" />
                                    </Grid>
                                    {/* Nueva Contraseña */}
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Nueva Contraseña</Typography>
                                        <TextField fullWidth type="password" />
                                    </Grid>
                                    {/* Botón Guardar Personal */}
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <ButtonBase variant="contained">
                                            Guardar Cambios
                                        </ButtonBase>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* ================= 2. ACORDEÓN: CONTACTOS DE CONFIANZA ================= */}
                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Contactos de Confianza</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {/* Tarjeta de Contacto Registrado */}
                                <CardBase elevation={3} sx={{ p: 2, borderRadius: 2, width: "100%", mb: 2, position: "relative" }}>
                                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                        <IconButton><EditIcon fontSize="small" /></IconButton>
                                        <IconButton><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Nombre:</strong></Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Parentesco:</strong></Typography>
                                    <Typography variant="body2"><strong>Teléfono:</strong></Typography>
                                </CardBase>
                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>
                                    Añadir Contacto
                                </ButtonBase>
                            </AccordionDetails>
                        </Accordion>

                        {/* ================= 3. ACORDEÓN PRINCIPAL: PARÁMETROS CLÍNICOS ================= */}
                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Parámetros Clínicos</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>

                                {/* Sub-Acordeón: Rangos de Alerta Glucémica */}
                                <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Rangos de Alerta Glucémica</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, mb: 3 }}>
                                        <Grid container spacing={2} sx={{ maxWidth: 500, mx: "auto" }}>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label="Límite de Hipoglucemia Severa" min={10} max={40} />
                                            </Grid>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label="Límite de Hiperglucemia Severa" min={10} max={40} />
                                            </Grid>
                                            <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>
                                                    Guardar Cambios
                                                </ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Sub-Acordeón: Tabla de Corrección Dinámica */}
                                <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Tabla de Corrección Dinámica</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, mb: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                                            <Box sx={{ width: 100 }}>
                                                <Typography variant="caption" sx={{ display: "block", textAlign: "center", fontWeight: "bold" }}>Mínimo mg/dL</Typography>
                                                <TextField placeholder="Value" />
                                            </Box>
                                            <Typography variant="h6" sx={{ alignSelf: "flex-end", mb: 0.5 }}>/</Typography>
                                            <Box sx={{ width: 100 }}>
                                                <Typography variant="caption" sx={{ display: "block", textAlign: "center", fontWeight: "bold" }}>Máximo mg/dL</Typography>
                                                <TextField placeholder="Value" />
                                            </Box>
                                            <Typography variant="body2" sx={{ alignSelf: "flex-end", mb: 1, fontWeight: "bold" }}>Aplicar:</Typography>
                                            <Box sx={{ width: 100 }}>
                                                <Typography variant="caption" sx={{ display: "block", textAlign: "center", fontWeight: "bold" }}>Dosis UI</Typography>
                                                <TextField placeholder="Value" />
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                                            <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>
                                                Añadir Rango
                                            </ButtonBase>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Sub-Acordeón: Esquema Basal */}
                                <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Esquema Basal</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CardBase sx={{ p: 2, borderRadius: 2, width: "100%", maxWidth: 400, mb: 2, position: "relative" }}>
                                            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                                <IconButton><EditIcon fontSize="small" /></IconButton>
                                                <IconButton><DeleteIcon fontSize="small" /></IconButton>
                                            </Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Hora de Inyección:</strong></Typography>
                                            <Typography variant="body2"><strong>Dosis Establecida:</strong></Typography>
                                        </CardBase>
                                        <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>
                                            Añadir Esquema
                                        </ButtonBase>
                                    </AccordionDetails>
                                </Accordion>

                            </AccordionDetails>
                        </Accordion>

                        {/* ================= 4. ACORDEÓN PRINCIPAL: PREFERENCIAS ================= */}
                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Preferencias</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>

                                {/* Sub-Acordeón: Recordatorios */}
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Recordatorios</Typography>
                                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Mediciones de Glucemia</Typography>
                                        <Switch defaultChecked />
                                    </Box>

                                    {/* Campos de Horas alineados verticalmente */}
                                    <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>Pre-Prandial</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>Post-Prandial</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>Nocturna</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Exámenes de Laboratorio</Typography>
                                            <Typography variant="caption" color="text.secondary">Cada 90 días</Typography>
                                        </Box>
                                        <Switch defaultChecked />
                                    </Box>
                                </Box>

                                {/* Sub-Acordeón: Notificaciones */}
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Notificaciones</Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 400, mx: "auto" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Notificaciones Push</Typography>
                                    <Switch defaultChecked />
                                </Box>

                                {/* Sub-Acordeón: Modo de Emergencia */}
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Modo de Emergencia</Typography>
                                <Grid container spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Bloqueo por Solapamiento de Dosis</Typography>
                                        <Switch defaultChecked />
                                    </Grid>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Canal SOS Automatizado</Typography>
                                        <Switch defaultChecked />
                                    </Grid>
                                </Grid>

                            </AccordionDetails>
                        </Accordion>

                        {/* ================= 5. ACORDEÓN: ZONA DE RIESGO ================= */}
                        <Box sx={{ display: "flex", flexDirection: 'column', gap: 2, p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FF4D4D" }}>
                                Zona de Riesgo
                            </Typography>
                            <Divider
                                sx={{
                                    borderBottomWidth: 5, // Grosor en píxeles
                                    borderColor: "#FF4D4D", // Color deseado
                                    my: 2 // Margen superior e inferior para espacio
                                }}
                            />
                            <ButtonBase
                                onClick={() => setOpenConfirm(true)}
                                sx={{
                                    bgcolor: "#FF4D4D",
                                    color: 'white',
                                    borderRadius: 1,
                                    "&:hover": { bgcolor: "#E53E3E" },
                                    fontWeight: "bold",
                                    px: 4,
                                    py: 1
                                }}
                            >
                                Eliminar Cuenta
                            </ButtonBase>

                            <Typography variant="caption" sx={{ color: "#718096" }}>
                                ADVERTENCIA: Esta acción no se puede deshacer
                            </Typography>

                            {/* Modal de Confirmación de seguridad */}
                            <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
                                <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: '20vh' }}>
                                    <Typography variant="h6" color="error">¿Estás completamente seguro?</Typography>
                                    <Typography sx={{ my: 2 }}>
                                        Al eliminar tu cuenta se borrarán todos tus datos permanentemente.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <ButtonBase onClick={() => setOpenConfirm(false)}>Cancelar</ButtonBase>
                                        <ButtonBase sx={{ color: '#FF4D4D' }} onClick={() => console.log("Cuenta eliminada")}>
                                            Confirmar Eliminación
                                        </ButtonBase>
                                    </Box>
                                </Paper>
                            </Modal>
                        </Box>
                    </Grid>

                </Grid>
            </Box>

            <Footer />
        </>
    );
}