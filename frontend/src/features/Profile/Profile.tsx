import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
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
import dayjs from 'dayjs';
import { ButtonBase } from "../../components/ui/Buttons/ButtonBase";
import NumberSpinner from "../../components/ui/NumberSpinner";
import { userApi } from "../../apis/user_config";
import { preferenceApi } from "../../apis/preference_config";
import { contactEmergenceApi, type ContactEmergenceData } from "../../apis/contact_emergence";
import { profilePersonalSchema, type ProfilePersonalData } from "../../schemas/profile";
import { changePasswordSchema, type ChangePasswordData } from "../../schemas/change_password";
import { contactEmergenceSchema, type ContactEmergenceData as ContactEmergenceFormData } from "../../schemas/contact_emergence";
import { preferenceStore } from "../../hooks/usePreferenceConfig";
import ModalBasalSchema from "./components/ModalBasalSchema";
import ModalDynamicCorrection from "./components/ModalDynamicCorrection";
import { ExportMedicalDataSection } from "./components/ExportMedicalDataSection";
import useLanguage from "../../hooks/useLanguage";
import { useUiStore } from "../../stores/uiStore";
import { getCaminoProgreso } from "../../apis/camino";
import yelmo_de_sabiduria from "../../assets/insigniasCamino/yelmo_de_sabiduria.png";
import escudo_de_fibra from "../../assets/insigniasCamino/escudo_de_fribra.png";
import lanzas from "../../assets/insigniasCamino/lanzas.png";
import imagen_8 from "../../assets/insigniasCamino/image 8.svg";
import imagen_9 from "../../assets/insigniasCamino/image 9.svg";

const insigniasCaminoPerfil = [
    { img: escudo_de_fibra, mundo: "Mundo 1", name: "Escudo de fibra" },
    { img: yelmo_de_sabiduria, mundo: "Mundo 2", name: "Yelmo de la sabiduría" },
    { img: imagen_8, mundo: "Mundo 3", name: "Peto de Precisión" },
    { img: imagen_9, mundo: "Mundo 4", name: "Gradas de equilibrio" },
    { img: lanzas, mundo: "Mundo 5", name: "Lanceta del Elegido" },
];

export function Profile() {
    const { t: tp } = useLanguage("profile");
    const authUser = useAuthStore((state) => state.user);
    const authLogout = useAuthStore((state) => state.logout);
    const authRefresh = useAuthStore((state) => state.refresh);
    const showToast = useUiStore((s) => s.showToast);

    const [totalNivelesCompletados, setTotalNivelesCompletados] = useState(0);
    const [insigniasDesbloqueadas, setInsigniasDesbloqueadas] = useState(0);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    const [prefForm, setPrefForm] = React.useState({
        hypo: 90,
        hiper: 160,
    });
    const [contacts, setContacts] = React.useState<ContactEmergenceData[]>([]);
    const [openContactModal, setOpenContactModal] = React.useState(false);
    const [editingContact, setEditingContact] = React.useState<ContactEmergenceData | null>(null);
    const [openBasalModal, setOpenBasalModal] = React.useState(false);
    const [openCorrectionModal, setOpenCorrectionModal] = React.useState(false);

    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        control: controlPersonal,
        formState: { errors: errorsPersonal },
    } = useForm<ProfilePersonalData>({
        resolver: zodResolver(profilePersonalSchema),
        mode: "onChange",
        defaultValues: {
            username: authUser?.username || undefined,
            email: authUser?.email || undefined,
            fechaNacimiento: authUser?.fechaNacimiento
                ? new Date(authUser.fechaNacimiento).toISOString()
                : undefined,
            sexo: (authUser?.sexo as "masculino" | "femenino") || undefined,
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
    } = useForm<ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
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
        preferenceApi.getPreferences().then((prefs) => {
            if (prefs) {
                setPrefForm({
                    hypo: prefs.thresholds?.hypo ?? 90,
                    hiper: prefs.thresholds?.hiper ?? 160,
                });
            }
        }).catch(() => { });
        loadContacts();
        getCaminoProgreso().then((progreso) => {
            const completados = progreso.ultimoNivelCompletado || 0;
            setTotalNivelesCompletados(completados);
            setInsigniasDesbloqueadas(Math.floor(completados / 3));
        }).catch(() => { });
    }, []);

    const onPersonalSave = async (data: ProfilePersonalData) => {
        try {
            const userId = authUser?.id;
            if (!userId) {
                showToast('error', tp("usuarioNoAutenticado"));
                return;
            }
            await userApi.update(userId, {
                username: data.username || undefined,
                email: data.email || undefined,
                sexo: data.sexo || undefined,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
            });
            // Sincroniza el store con los datos frescos del servidor
            await authRefresh();
            showToast('success', tp("guardadoExitoPersonal"));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("errorGuardar"));
        }
    };

    const onChangePassword = async (data: ChangePasswordData) => {
        try {
            await userApi.changePassword(data.currentPassword, data.newPassword);
            resetPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('success', tp("passwordUpdated"));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("passwordUpdateError"));
        }
    };

    const handlePrefSave = async () => {
        try {
            const thresholds = {
                hypo: Number(prefForm.hypo),
                hiper: Number(prefForm.hiper),
            };
            // Validacion cruzada: hipo debe ser menor a hiper
            if (!(thresholds.hypo > 0 && thresholds.hiper > 0 && thresholds.hypo < thresholds.hiper)) {
                showToast('error', tp("errorRangosInvalidos"));
                return;
            }

            const current = await preferenceApi.getPreferences();
            if (!current?.userId) {
                showToast('error', tp("errorCarga"));
                return;
            }

            await preferenceApi.savePreferences({
                ...current,
                thresholds,
            });
            await preferenceStore.getState().load();
            showToast('success', tp("guardadoExitoClinico"));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("errorGuardar"));
        }
    };

    const onContactSave = async (data: ContactEmergenceFormData) => {
        try {
            const isEditing = Boolean(editingContact);
            const payload = {
                ...data,
                name: data.name.trim(),
                telefono: data.telefono?.trim() || undefined,
            };
            if (editingContact) {
                await contactEmergenceApi.update(editingContact.id, payload);
            } else {
                await contactEmergenceApi.create(payload);
            }
            setOpenContactModal(false);
            setEditingContact(null);
            resetContact({ name: '', parentesco: '', telefono: '' });
            await loadContacts();
            showToast('success', isEditing ? tp("contactoActualizado") : tp("contactoAgregado"));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("errorGuardar"));
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
            showToast('success', tp("contactoEliminado"));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("errorEliminar"));
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const userId = authUser?.id;
            if (!userId) return;
            await userApi.delete(userId);
            await authLogout();
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : tp("errorEliminar"));
        }
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: "100vh", py: 4, px: 2 }}>
                <Grid container spacing={4} sx={{ mx: "auto", maxWidth: 'lg' }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CardBase elevation={4} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <AvatarProfile />
                                <Typography variant="h6" sx={{ mt: 3 }}>
                                    {authUser?.username || 'Guerrero'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" align="center">{tp("warriorPath")}</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 0.5 }}>
                                    <LinearProgress variant="determinate" value={Math.round((totalNivelesCompletados / 15) * 100)} sx={{ flexGrow: 1, height: 20, borderRadius: 5, bgcolor: 'primary.dark' }} />
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: "bold" }}>{Math.round((totalNivelesCompletados / 15) * 100)}%</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                                    {totalNivelesCompletados} / 15 niveles completados
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "left" }}>
                                <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>{tp("badges")}</Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    {insigniasCaminoPerfil.map((insignia, index) => (
                                        <Box
                                            key={`${insignia.name}-${index}`}
                                            sx={{
                                                bgcolor: index < insigniasDesbloqueadas ? 'primary.500' : 'rgba(255,255,255,0.3)',
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: 'flex-start',
                                                p: 1.5,
                                                borderRadius: 2,
                                                gap: 2,
                                                filter: index < insigniasDesbloqueadas ? 'none' : 'grayscale(100%) opacity(40%)',
                                            }}
                                        >
                                            <Box component="img" src={insignia.img} alt={insignia.name} sx={{ width: 50, height: 50, objectFit: "contain" }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ color: index < insigniasDesbloqueadas ? 'inherit' : '#8e8e8e' }}>{insignia.name}</Typography>
                                                <Typography variant="caption" sx={{ color: index < insigniasDesbloqueadas ? '#4caf50' : '#8e8e8e', textTransform: 'uppercase' }}>{insignia.mundo}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </CardBase>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" sx={{ my: 4 }}>{tp("profileTitle")}</Typography>

                        <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("personalSection")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("usernameLabel")}</Typography>
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
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("birthDateLabel")}</Typography>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Controller
                                                name="fechaNacimiento"
                                                control={controlPersonal}
                                                render={({ field: { onChange, value, ...rest } }) => (
                                                    <DateField
                                                        {...rest}
                                                        fullWidth
                                                        label={tp("birthDateLabel")}
                                                        format="DD/MM/YYYY"
                                                        value={value ? dayjs(value) : null}
                                                        onChange={(newValue) => onChange(newValue ? newValue.toISOString() : '')}
                                                        slotProps={{
                                                            textField: {
                                                                error: !!errorsPersonal.fechaNacimiento,
                                                                helperText: errorsPersonal.fechaNacimiento?.message,
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("sexLabel")}</Typography>
                                        <Controller
                                            name="sexo"
                                            control={controlPersonal}
                                            render={({ field: { onChange, value, ...rest } }) => (
                                                <TextField
                                                    {...rest}
                                                    select
                                                    fullWidth
                                                    value={value || ''}
                                                    onChange={onChange}
                                                    error={!!errorsPersonal.sexo}
                                                    helperText={errorsPersonal.sexo?.message}
                                                >
                                                    <MenuItem value="masculino">{tp("sexMale")}</MenuItem>
                                                    <MenuItem value="femenino">{tp("sexFemale")}</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("emailLabel")}</Typography>
                                        <TextField
                                            {...registerPersonal('email')}
                                            fullWidth
                                            placeholder={authUser?.email || ''}
                                            error={!!errorsPersonal.email}
                                            helperText={errorsPersonal.email?.message}
                                        />
                                    </Grid>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <ButtonBase variant="contained" onClick={handleSubmitPersonal(onPersonalSave)}>{tp("saveChanges")}</ButtonBase>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("changePasswordTitle")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("currentPasswordLabel")}</Typography>
                                        <TextField
                                            {...registerPassword('currentPassword')}
                                            fullWidth
                                            type="password"
                                            autoComplete="current-password"
                                            error={!!errorsPassword.currentPassword}
                                            helperText={errorsPassword.currentPassword?.message}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("newPasswordLabel")}</Typography>
                                        <TextField
                                            {...registerPassword('newPassword')}
                                            fullWidth
                                            type="password"
                                            autoComplete="new-password"
                                            error={!!errorsPassword.newPassword}
                                            helperText={errorsPassword.newPassword?.message}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>{tp("confirmPasswordLabel")}</Typography>
                                        <TextField
                                            {...registerPassword('confirmPassword')}
                                            fullWidth
                                            type="password"
                                            autoComplete="new-password"
                                            error={!!errorsPassword.confirmPassword}
                                            helperText={errorsPassword.confirmPassword?.message}
                                        />
                                    </Grid>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <ButtonBase
                                            variant="contained"
                                            disabled={isSubmittingPassword}
                                            onClick={handleSubmitPassword(onChangePassword)}
                                        >
                                            {tp("changePasswordButton")}
                                        </ButtonBase>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("emergencyContacts")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {contacts.map((contact) => (
                                    <CardBase key={contact.id} elevation={3} sx={{ p: 2, borderRadius: 2, width: "100%", mb: 2, position: "relative" }}>
                                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                            <IconButton onClick={() => handleContactEdit(contact)}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton onClick={() => handleContactDelete(contact.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>{tp("contactName")}</strong> {contact.name}</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>{tp("contactRelationship")}</strong> {contact.parentesco}</Typography>
                                        <Typography variant="body2"><strong>{tp("contactPhone")}</strong> {contact.telefono || '—'}</Typography>
                                    </CardBase>
                                ))}
                                {contacts.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{tp("noContacts")}</Typography>
                                )}
                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={openAddContactModal}>
{tp("addContact")}
                                </ButtonBase>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("clinicalParams")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Accordion defaultExpanded sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("glucoseAlertRanges")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, mb: 3 }}>
                                        <Grid container spacing={2} sx={{ maxWidth: 500, mx: "auto" }}>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label={tp("severeHypoLimit")} min={0} max={400} value={prefForm.hypo} onValueChange={(_v: number | null, _e: unknown) => { if (_v !== null) setPrefForm({ ...prefForm, hypo: _v }); }} />
                                            </Grid>
                                            <Grid size={{ sm: 12, md: 6 }}>
                                                <NumberSpinner label={tp("severeHyperLimit")} min={0} max={500} value={prefForm.hiper} onValueChange={(_v: number | null, _e: unknown) => { if (_v !== null) setPrefForm({ ...prefForm, hiper: _v }); }} />
                                            </Grid>
                                            <Grid size={12} sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                                <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={handlePrefSave}>
                                                    {tp("saveChanges")}
                                                </ButtonBase>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("dynamicCorrection")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                            {tp("correctionDesc")}
                                        </Typography>
                                        <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={() => setOpenCorrectionModal(true)}>
                                            {tp("addRange")}
                                        </ButtonBase>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "1px solid #CBD5E0", mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("basalScheme")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                            {tp("basalDesc")}
                                        </Typography>
                                        <ButtonBase variant="contained" sx={{ bgcolor: "#63B3ED", "&:hover": { bgcolor: "#4299E1" }, fontWeight: "bold" }} onClick={() => setOpenBasalModal(true)}>
                                            {tp("addSchema")}
                                        </ButtonBase>
                                    </AccordionDetails>
                                </Accordion>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("exportTitle")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <ExportMedicalDataSection />
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ background: "none", boxShadow: "none", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, borderBottom: "2px solid #3182CE", mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tp("preferences")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mb: 4 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("reminders")}</Typography>
                                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tp("glucoseMeasurements")}</Typography>
                                        <Switch defaultChecked />
                                    </Box>
                                    <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>{tp("prePrandial")}</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>{tp("postPrandial")}</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>{tp("nocturnal")}</Typography>
                                            <TextField type="time" defaultValue="00:00" sx={{ width: 150 }} />
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tp("labExams")}</Typography>
                                            <Typography variant="caption" color="text.secondary">{tp("every90Days")}</Typography>
                                        </Box>
                                        <Switch defaultChecked />
                                    </Box>
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("notifications")}</Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 400, mx: "auto" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tp("pushNotifications")}</Typography>
                                    <Switch defaultChecked />
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>{tp("emergencyMode")}</Typography>
                                <Grid container spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tp("sosChannel")}</Typography>
                                        <Switch defaultChecked />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Modal open={openContactModal} onClose={() => setOpenContactModal(false)}>
                            <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, mx: { xs: 2, sm: 'auto' }, mt: { xs: '10vh', sm: '20vh' } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>{editingContact ? tp("editContact") : tp("addContact")}</Typography>
                                <TextField
                                    {...registerContact('name')}
                                    fullWidth
                                    label={tp("contactName")}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 2 }}
                                    error={!!errorsContact.name}
                                    helperText={errorsContact.name?.message}
                                />
                                <TextField
                                    {...registerContact('parentesco')}
                                    fullWidth
                                    label={tp("contactRelationship")}
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
                                    label={tp("contactPhone")}
                                    variant="outlined"
                                    size="small"
                                    type="tel"
                                    error={!!errorsContact.telefono}
                                    helperText={errorsContact.telefono?.message}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <ButtonBase onClick={() => setOpenContactModal(false)}>{tp("cancel")}</ButtonBase>
                                    <ButtonBase sx={{ color: '#3182CE' }} onClick={handleSubmitContact(onContactSave)}>
                                        {editingContact ? tp("update") : tp("save")}
                                    </ButtonBase>
                                </Box>
                            </Paper>
                        </Modal>

                        <Box sx={{ display: "flex", flexDirection: 'column', gap: 2, p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FF4D4D" }}>{tp("dangerZone")}</Typography>
                            <Divider sx={{ borderBottomWidth: 5, borderColor: "#FF4D4D", my: 2 }} />
                            <ButtonBase onClick={() => setOpenConfirm(true)} sx={{ bgcolor: "#FF4D4D", color: 'white', borderRadius: 1, "&:hover": { bgcolor: "#E53E3E" }, fontWeight: "bold", px: 4, py: 1 }}>
                                {tp("deleteAccount")}
                            </ButtonBase>
                            <Typography variant="caption" sx={{ color: "#718096" }}>{tp("deleteWarning")}</Typography>
                            <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
                                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, mx: { xs: 2, sm: 'auto' }, mt: { xs: '10vh', sm: '20vh' } }}>
                                    <Typography variant="h6" color="error">{tp("deleteConfirmTitle")}</Typography>
                                    <Typography sx={{ my: 2 }}>{tp("deleteConfirmDesc")}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <ButtonBase onClick={() => setOpenConfirm(false)}>{tp("cancel")}</ButtonBase>
                                        <ButtonBase sx={{ color: '#FF4D4D' }} onClick={handleDeleteAccount}>{tp("confirmDelete")}</ButtonBase>
                                    </Box>
                                </Paper>
                            </Modal>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Footer />

            <ModalBasalSchema
                open={openBasalModal}
                onClose={() => setOpenBasalModal(false)}
            />
            <ModalDynamicCorrection
                open={openCorrectionModal}
                onClose={() => setOpenCorrectionModal(false)}
            />
        </>
    );
}
