import React, { useEffect } from "react";
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
    Modal,
    Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import { CardBase } from "../../components/ui/Cards/CardBase";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AvatarProfile } from "./components/AvatarProfile";
import Medal from '../../assets/icons/medal.svg';
import { useAuthStore } from "../../stores/authStore";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { ButtonBase } from "../../components/ui/Buttons/ButtonBase";
import NumberSpinner from "../../components/ui/NumberSpinner";
import { apiPrivate } from "../../apis/axios";
import { userApi } from "../../apis/user_config";
import { contactEmergenceApi, type ContactEmergenceData } from "../../apis/contact_emergence";
import { profilePersonalSchema, type ProfilePersonalData } from "../../schemas/profile";
import { contactEmergenceSchema, type ContactEmergenceData as ContactEmergenceFormData } from "../../schemas/contact_emergence";

export function Profile() {
    const authUser = useAuthStore((state) => state.user);
    const authLogout = useAuthStore((state) => state.logout);

    const [progress] = React.useState(25);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    const [prefForm, setPrefForm] = React.useState({
        hypo: 90,
        hiper: 160,
        breakfast: 100,
        lunch: 100,
        dinner: 100,
        sensitivity: 1,
    });
    const [msg, setMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [contacts, setContacts] = React.useState<ContactEmergenceData[]>([]);
    const [openContactModal, setOpenContactModal] = React.useState(false);
    const [editingContact, setEditingContact] = React.useState<ContactEmergenceData | null>(null);

    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        formState: { errors: errorsPersonal },
    } = useForm<ProfilePersonalData>({
        resolver: zodResolver(profilePersonalSchema),
        mode: "onChange",
    });

    const {
        register: registerContact,
        handleSubmit: handleSubmitContact,
        reset: resetContact,
        formState: { errors: errorsContact },
    } = useForm<ContactEmergenceFormData>({
        resolver: zodResolver(contactEmergenceSchema),
        mode: "onChange",
        defaultValues: { name: '', parentesco: '', telefono: '' },
    });

    const loadContacts = async () => {
        try {
            const data = await contactEmergenceApi.getAll();
            setContacts(data);
        } catch { }
    };

    useEffect(() => {
        apiPrivate.get('/preference').then((res) => {
            const prefs = res.data?.data;
            if (prefs) {
                setPrefForm({
                    hypo: prefs.thresholds?.hypo ?? 90,
                    hiper: prefs.thresholds?.hiper ?? 160,
                    breakfast: prefs.insulinRatios?.breakfast ?? 100,
                    lunch: prefs.insulinRatios?.lunch ?? 100,
                    dinner: prefs.insulinRatios?.dinner ?? 100,
                    sensitivity: prefs.sensitivity ?? 1,
                });
            }
        }).catch(() => { });
        loadContacts();
    }, []);

    const onPersonalSave = async (data: ProfilePersonalData) => {
        try {
            const userId = authUser?.id;
            if (!userId) {
                setMsg({ type: 'error', text: 'Usuario no autenticado' });
                return;
            }
            await userApi.update(userId, {
                username: data.username || undefined,
                email: data.email || undefined,
                sexo: data.sexo || undefined,
            });
            setMsg({ type: 'success', text: 'Datos personales guardados' });
        } catch (error) {
            setMsg({ type: 'error', text: error instanceof Error ? error.message : 'Error al guardar' });
        }
    };

    const handlePrefSave = async () => {
        try {
            await apiPrivate.get('/preference').then(async (res) => {
                const current = res.data?.data;
                if (!current?.userId) {
                    setMsg({ type: 'error', text: 'No hay preferencias cargadas' });
                    return;
                }
                await apiPrivate.post('/preference', {
                    profileImg: current.profileImg,
                    unitMeasure: current.unitMeasure,
                    thresholds: { hypo: prefForm.hypo, hiper: prefForm.hiper },
                    insulinRatios: { breakfast: prefForm.breakfast, lunch: prefForm.lunch, dinner: prefForm.dinner },
                    sensitivity: prefForm.sensitivity,
                });
                setMsg({ type: 'success', text: 'Parámetros clínicos guardados' });
            });
        } catch (error) {
            setMsg({ type: 'error', text: error instanceof Error ? error.message : 'Error al guardar' });
        }
    };

    const onContactSave = async (data: ContactEmergenceFormData) => {
        try {
            if (editingContact) {
                await contactEmergenceApi.update(editingContact.id, data);
            } else {
                await contactEmergenceApi.create(data);
            }
            setOpenContactModal(false);
            setEditingContact(null);
            resetContact({ name: '', parentesco: '', telefono: '' });
            await loadContacts();
            setMsg({ type: 'success', text: editingContact ? 'Contacto actualizado' : 'Contacto agregado' });
        } catch (error) {
            setMsg({ type: 'error', text: error instanceof Error ? error.message : 'Error al guardar contacto' });
        }
    };

    const handleContactEdit = (contact: ContactEmergenceData) => {
        setEditingContact(contact);
        resetContact({
            name: contact.name,
            parentesco: contact.parentesco as ContactEmergenceFormData['parentesco'],
            telefono: contact.telefono || '',
        });
        setOpenContactModal(true);
    };

    const openAddContactModal = () => {
        setEditingContact(null);
        resetContact({ name: '', parentesco: '', telefono: '' });
        setOpenContactModal(true);
    };

    const handleContactDelete = async (id: string) => {
        try {
            await contactEmergenceApi.delete(id);
            await loadContacts();
            setMsg({ type: 'success', text: 'Contacto eliminado' });
        } catch (error) {
            setMsg({ type: 'error', text: error instanceof Error ? error.message : 'Error al eliminar' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const userId = authUser?.id;
            if (!userId) return;
            await userApi.delete(userId);
            await authLogout();
        } catch (error) {
            setMsg({ type: 'error', text: error instanceof Error ? error.message : 'Error al eliminar' });
        }
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: "100vh", py: 4, px: 2 }}>
                {msg && (
                    <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ maxWidth: 'lg', mx: 'auto', mb: 2 }}>
                        {msg.text}
                    </Alert>
                )}
                <Grid container spacing={4} sx={{ mx: "auto", maxWidth: 'lg' }}>
                    <Grid size={4}>
                        <CardBase elevation={4} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <AvatarProfile />
                                <Typography variant="h6" sx={{ mt: 3 }}>
                                    {authUser?.username || 'Guerrero'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 4, p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="#4A5568">Días en Racha</Typography>
                                <Typography variant="h3" sx={{ my: 1, color: "success.light" }}>7</Typography>
                                <Typography variant="caption" color="#718096">Días seguidos en la zona segura</Typography>
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" align="center">La Ruta del Guerrero</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 0.5 }}>
                                    <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 20, borderRadius: 5, bgcolor: 'primary.dark' }} />
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: "bold" }}>{progress}%</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2 }}>Nivel Actual</Typography>
                                <Typography variant="caption" sx={{ mt: 4 }}>Mundo 2 - Misión 8</Typography>
                            </Box>
                            <Box sx={{ textAlign: "left" }}>
                                <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>Insignias Obtenidas</Typography>
                                <Box sx={{ bgcolor: 'primary.500', display: "flex", alignItems: "center", justifyContent: 'center', p: 1.5, borderRadius: 2, gap: 2 }}>
                                    <Box component="img" src={Medal} alt="Medalla" sx={{ width: 50, height: 50 }} />
                                    <Box>
                                        <Typography variant="body2">Escudo de Fibra</Typography>
                                        <Typography variant="caption">Mundo 1</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardBase>
                    </Grid>

                    <Grid size={8}>
                        <Typography variant="h4" sx={{ my: 4 }}>Perfil y Configuraciones</Typography>

                        <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Personal</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Nombre de usuario</Typography>
                                        <TextField
                                            {...registerPersonal('username')}
                                            fullWidth
                                            placeholder={authUser?.username || ''}
                                            variant="outlined"
                                            sx={{ borderRadius: 1 }}
                                            error={!!errorsPersonal.username}
                                            helperText={errorsPersonal.username?.message}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Fecha de Nacimiento</Typography>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DateField fullWidth label="Fecha de Nacimiento" />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Sexo</Typography>
                                        <TextField
                                            {...registerPersonal('sexo')}
                                            select
                                            fullWidth
                                            error={!!errorsPersonal.sexo}
                                            helperText={errorsPersonal.sexo?.message}
                                        >
                                            <MenuItem value="masculino">Masculino</MenuItem>
                                            <MenuItem value="femenino">Femenino</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Correo Electrónico</Typography>
                                        <TextField
                                            {...registerPersonal('email')}
                                            fullWidth
                                            placeholder={authUser?.email || ''}
                                            error={!!errorsPersonal.email}
                                            helperText={errorsPersonal.email?.message}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Contraseña Actual</Typography>
                                        <TextField fullWidth type="password" />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Nueva Contraseña</Typography>
                                        <TextField fullWidth type="password" />
                                    </Grid>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <ButtonBase variant="contained" onClick={handleSubmitPersonal(onPersonalSave)}>Guardar Cambios</ButtonBase>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Contactos de Emergencia</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {contacts.map((contact) => (
                                    <CardBase key={contact.id} elevation={3} sx={{ p: 2, borderRadius: 2, width: "100%", mb: 2, position: "relative" }}>
                                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                            <IconButton onClick={() => handleContactEdit(contact)}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton onClick={() => handleContactDelete(contact.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Nombre:</strong> {contact.name}</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Parentesco:</strong> {contact.parentesco}</Typography>
                                        <Typography variant="body2"><strong>Teléfono:</strong> {contact.telefono || '—'}</Typography>
                                    </CardBase>
                                ))}
                                {contacts.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>No hay contactos de emergencia registrados</Typography>
                                )}
                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={openAddContactModal}>
                                    Añadir Contacto
                                </ButtonBase>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Parámetros Clínicos</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Rangos de Alerta Glucémica</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, mb: 3 }}>
                                        <Grid container spacing={2} sx={{ maxWidth: 500, mx: "auto" }}>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label="Límite de Hipoglucemia Severa" min={10} max={40} value={prefForm.hypo} onValueChange={(_v: number | null, _e: unknown) => { if (_v !== null) setPrefForm({ ...prefForm, hypo: _v }); }} />
                                            </Grid>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label="Límite de Hiperglucemia Severa" min={10} max={40} value={prefForm.hiper} onValueChange={(_v: number | null, _e: unknown) => { if (_v !== null) setPrefForm({ ...prefForm, hiper: _v }); }} />
                                            </Grid>
                                            <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={handlePrefSave}>
                                                    Guardar Cambios
                                                </ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

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
                                            <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>Añadir Rango</ButtonBase>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

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
                                        <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }}>Añadir Esquema</ButtonBase>
                                    </AccordionDetails>
                                </Accordion>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Preferencias</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Recordatorios</Typography>
                                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Mediciones de Glucemia</Typography>
                                        <Switch defaultChecked />
                                    </Box>
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
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Notificaciones</Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 400, mx: "auto" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Notificaciones Push</Typography>
                                    <Switch defaultChecked />
                                </Box>
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

                        <Modal open={openContactModal} onClose={() => setOpenContactModal(false)}>
                            <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: '20vh' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>{editingContact ? 'Editar Contacto' : 'Añadir Contacto'}</Typography>
                                <TextField
                                    {...registerContact('name')}
                                    fullWidth
                                    label="Nombre"
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 2 }}
                                    error={!!errorsContact.name}
                                    helperText={errorsContact.name?.message}
                                />
                                <TextField
                                    {...registerContact('parentesco')}
                                    fullWidth
                                    label="Parentesco"
                                    variant="outlined"
                                    size="small"
                                    select
                                    sx={{ mb: 2 }}
                                    error={!!errorsContact.parentesco}
                                    helperText={errorsContact.parentesco?.message}
                                >
                                    <MenuItem value="madre">Madre</MenuItem>
                                    <MenuItem value="padre">Padre</MenuItem>
                                    <MenuItem value="hermano">Hermano</MenuItem>
                                    <MenuItem value="hermana">Hermana</MenuItem>
                                    <MenuItem value="abuelo">Abuelo</MenuItem>
                                    <MenuItem value="abuela">Abuela</MenuItem>
                                    <MenuItem value="tio">Tío</MenuItem>
                                    <MenuItem value="tia">Tía</MenuItem>
                                    <MenuItem value="tutor">Tutor</MenuItem>
                                    <MenuItem value="otro">Otro</MenuItem>
                                </TextField>
                                <TextField
                                    {...registerContact('telefono')}
                                    fullWidth
                                    label="Teléfono"
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <ButtonBase onClick={() => setOpenContactModal(false)}>Cancelar</ButtonBase>
                                    <ButtonBase sx={{ color: '#3182CE' }} onClick={handleSubmitContact(onContactSave)}>
                                        {editingContact ? 'Actualizar' : 'Guardar'}
                                    </ButtonBase>
                                </Box>
                            </Paper>
                        </Modal>

                        <Box sx={{ display: "flex", flexDirection: 'column', gap: 2, p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FF4D4D" }}>Zona de Riesgo</Typography>
                            <Divider sx={{ borderBottomWidth: 5, borderColor: "#FF4D4D", my: 2 }} />
                            <ButtonBase onClick={() => setOpenConfirm(true)} sx={{ bgcolor: "#FF4D4D", color: 'white', borderRadius: 1, "&:hover": { bgcolor: "#E53E3E" }, fontWeight: "bold", px: 4, py: 1 }}>
                                Eliminar Cuenta
                            </ButtonBase>
                            <Typography variant="caption" sx={{ color: "#718096" }}>ADVERTENCIA: Esta acción no se puede deshacer</Typography>
                            <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
                                <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: '20vh' }}>
                                    <Typography variant="h6" color="error">¿Estás completamente seguro?</Typography>
                                    <Typography sx={{ my: 2 }}>Al eliminar tu cuenta se borrarán todos tus datos permanentemente.</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <ButtonBase onClick={() => setOpenConfirm(false)}>Cancelar</ButtonBase>
                                        <ButtonBase sx={{ color: '#FF4D4D' }} onClick={handleDeleteAccount}>Confirmar Eliminación</ButtonBase>
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
