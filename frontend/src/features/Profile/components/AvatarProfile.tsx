import React from "react";
import { Avatar, Box, Grid, Modal } from "@mui/material";
import { ButtonBase } from "../../../components/ui/Buttons/ButtonBase";
import EditIcon from '@mui/icons-material/Edit';
import { AVATAR_MAP, AVATAR_NAMES } from "../../../constants/avatars";
import { usePreferenceConfig } from "../../../hooks/usePreferenceConfig";

const baseAvatarSx = {
    width: { xs: 80, sm: 100, md: 120 },
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
    border: "4px solid #3182CE",
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 10px rgba(49, 130, 206, 0.3)'
};

export function AvatarProfile() {
    const [openAvatarEdit, setOpenAvatarEdit] = React.useState<boolean>(false);

    const { preference, changeAvatar, save } = usePreferenceConfig();

    const currentAvatar = preference?.profileImg && AVATAR_MAP[preference.profileImg]
        ? AVATAR_MAP[preference.profileImg]
        : AVATAR_MAP.GlucoAstro;

    const handleOpenModalAvatarEdit = () => {
        setOpenAvatarEdit(!openAvatarEdit);
    };

    return (
        <>
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
                    src={currentAvatar}
                    alt="Perfil actual"
                    sx={{
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        border: "2px solid #3182CE"
                    }}
                />

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
                        width: { xs: '90%', sm: 450 },
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        outline: 'none'
                    }}
                >
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {AVATAR_NAMES.map((name) => {
                            return (
                                <Grid size={4} key={name} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={AVATAR_MAP[name]}
                                        alt={name}
                                        onClick={() => { changeAvatar(name) }}
                                        sx={name === preference?.profileImg ? AvatarSelectedSx : AvatarNormalSx}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

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
                            onClick={() => {
                                if (preference) save(preference);
                                setOpenAvatarEdit(false);
                            }}
                        >
                            Guardar
                        </ButtonBase>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}