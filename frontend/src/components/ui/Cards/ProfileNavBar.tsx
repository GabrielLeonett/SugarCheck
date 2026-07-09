import { Avatar, Box, Divider, Stack, Typography } from '@mui/material';
import ExitIcon from "@mui/icons-material/ExitToApp";
import ChangeIcon from "@mui/icons-material/ChangeCircle";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useAuthStore } from '../../../stores/authStore.tsx';
import useLanguage from '../../../hooks/useLanguage.tsx';
import { CardBase } from './CardBase.tsx';
import { ConfigRow } from '../ConfigRow.tsx';
import { useNavigate } from 'react-router-dom';
import { usePreferenceConfig } from '../../../hooks/usePreferenceConfig';
import { AVATAR_MAP } from '../../../constants/avatars';

interface ProfileNavBarProps {
    open?: boolean;
}

export default function ProfileNavBar({ open }: ProfileNavBarProps) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate()
    const { preference } = usePreferenceConfig();

    const avatarSrc = preference?.profileImg && AVATAR_MAP[preference.profileImg]
        ? AVATAR_MAP[preference.profileImg]
        : undefined;

    const userInitials = user?.username
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || '';

    const { t } = useLanguage("common");
    if (!open) return null;
    return (
        <CardBase
            sx={{
                width: 280,
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                p: 0,
                borderRadius: 2,
                boxShadow: 4,
                position: 'fixed',
                right: 16,
                top: 70,
                zIndex: 999,
                overflow: 'hidden',
            }}
            elevation={4}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
            }}>
                <Avatar
                    src={avatarSrc}
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.dark',
                        fontSize: 18,
                        fontWeight: 700,
                        border: '2px solid rgba(255,255,255,0.3)',
                    }}
                >
                    {userInitials}
                </Avatar>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {user?.username || "USUARIO ANÓNIMO"}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {user?.email || ''}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ p: 1.5 }}>
                <ConfigRow />
            </Box>

            <Divider />

            <Stack spacing={0.5} sx={{ p: 1.5 }}>
                {[
                    { icon: <AccountBoxIcon />, label: t("perfil"), onClick: () => navigate('/perfil') },
                    { icon: <ChangeIcon />, label: t("cambiarContrasena"), onClick: () => { } },
                    { icon: <ExitIcon />, label: t("cerrarSesion"), onClick: logout },
                ].map((item, index) => (
                    <Box
                        key={index}
                        component="div"
                        role="button"
                        tabIndex={0}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            userSelect: "none",
                            "&:hover": { bgcolor: "action.hover" },
                            "&:focus-visible": { bgcolor: "action.focus", outline: "none" },
                            transition: "background-color 0.2s"
                        }}
                        onClick={item.onClick}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && item.onClick) {
                                e.preventDefault();
                                item.onClick();
                            }
                        }}
                    >
                        {item.icon}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </CardBase>
    )
}