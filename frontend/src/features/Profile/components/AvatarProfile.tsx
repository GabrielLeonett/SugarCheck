import React from "react";
import { Avatar, Box, Grid, Modal } from "@mui/material";
import { ButtonBase } from "../../../components/ui/Buttons/ButtonBase";
import EditIcon from '@mui/icons-material/Edit';
// Imágenes de perfil
import GlucoAstro from '../../../assets/profile/GlucoAstro.png';
import GlucoBeisbol from '../../../assets/profile/GlucoBeisbol.png';
import GlucoBombero from '../../../assets/profile/GlucoBombero.png';
import GlucoFutbolista from '../../../assets/profile/GlucoFutbolista.png';
import GlucoInformatico from '../../../assets/profile/GlucoInformatico.png';
import GlucoMedico from '../../../assets/profile/GlucoMedico.png';
import GlucoPintor from '../../../assets/profile/GlucoPintor.png';
import GlucoPolicia from '../../../assets/profile/GlucoPolicia.png';
import GlucoMago from '../../../assets/profile/GucloMago.png'; // Corregido typo en la importación (Guclo -> Gluco)
import { useProfileAvatar } from "../../../hooks/useProfileAvatar";

// Exportamos el array por si necesitas renderizar la lista en un componente de selección
const ImagesProfile = [
    GlucoAstro, GlucoBeisbol, GlucoBombero,
    GlucoFutbolista, GlucoInformatico,
    GlucoMedico, GlucoPintor, GlucoPolicia,
    GlucoMago
];

// Estilos base comunes para los avatares de la lista
const baseAvatarSx = {
    width: { xs: 80, sm: 100, md: 120 }, // Tamaños responsivos para evitar desbordes en móviles
    height: { xs: 80, sm: 100, md: 120 },
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
};

const AvatarNormalSx = {
    ...baseAvatarSx,
    border: "2px solid #e0e0e0",
    '&:hover': {
        transform: 'scale(1.05)',
        borderColor: '#3182CE'
    }
};

const AvatarSelectedSx = {
    ...baseAvatarSx,
    border: "4px solid #3182CE", // Borde más grueso para notar la selección
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 10px rgba(49, 130, 206, 0.3)'
};

export function AvatarProfile() {
    const { avatarSelected, changeAvatar } = useProfileAvatar()
    const [openAvatarEdit, setOpenAvatarEdit] = React.useState<boolean>(false);

    const handleOpenModalAvatarEdit = () => {
        setOpenAvatarEdit(!openAvatarEdit);
    };

    return (
        <>
            {/* Avatar Principal Visible en el Perfil */}
            <Box
                sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    cursor: 'pointer',
                    '&:hover .overlay': { opacity: 1 }
                }}
            >
                <Avatar
                    src={avatarSelected} // Ahora cambia dinámicamente con el estado
                    alt="Perfil actual"
                    sx={{
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        border: "2px solid #3182CE"
                    }}
                />

                {/* Capa de Edición que se activa en Hover */}
                <Box
                    className="overlay"
                    onClick={handleOpenModalAvatarEdit}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'rgba(66, 66, 66, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    <EditIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
            </Box>

            {/* Modal de Selección */}
            <Modal
                open={openAvatarEdit}
                onClose={handleOpenModalAvatarEdit}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: { xs: '90%', sm: 450 }, // Ajustado para un ancho de modal óptimo
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        outline: 'none'
                    }}
                >
                    {/* Rejilla de Avatares */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {ImagesProfile.map((img, index) => {
                            return (
                                <Grid size={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={img}
                                        alt={`Opción ${index}`}
                                        onClick={() => { changeAvatar(img) }} // Guarda la selección temporal en el estado
                                        sx={img === avatarSelected ? AvatarSelectedSx : AvatarNormalSx}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Botones de Acción */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
                        <ButtonBase
                            variant="outlined"
                            color="error"
                            onClick={handleOpenModalAvatarEdit}
                        >
                            Cancelar
                        </ButtonBase>
                        <ButtonBase
                            variant="contained"
                            color="primary"
                            onClick={handleOpenModalAvatarEdit}
                        >
                            Guardar
                        </ButtonBase>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}