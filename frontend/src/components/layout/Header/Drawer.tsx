import { useState } from "react";
import {
  IconButton, List, ListItem, Box, Drawer, ListItemButton,
  ListItemText, Collapse, ListItemIcon, Avatar, Divider, Typography
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExitIcon from "@mui/icons-material/ExitToApp";
import type { NavItemType, NavItemWithSubmenu, NavItem } from "../../../types/types";
import { useAuthStore } from "../../../stores/authStore";
import { usePreferenceConfig } from "../../../hooks/usePreferenceConfig";
import { AVATAR_MAP } from "../../../constants/avatars";
import { ConfigRow } from "../../ui/ConfigRow";

interface DrawerAppBarProps {
    drawerOpen: boolean;
    handleDrawerToggle: () => void;
    handleNavClick: (href: string) => void;
    navItems: NavItemType[];
}

export default function DrawerAppBar({ drawerOpen, handleDrawerToggle, handleNavClick, navItems }: DrawerAppBarProps) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { preference } = usePreferenceConfig();

    const avatarSrc = preference?.profileImg && AVATAR_MAP[preference.profileImg]
        ? AVATAR_MAP[preference.profileImg]
        : undefined;

    const userInitials = user?.username
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "";

    return (
        <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
                "& .MuiDrawer-paper": {
                    backgroundColor: "background.paper",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    width: 280,
                },
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ flex: 1, overflow: "auto" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2.5,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                        }}
                    >
                        <Avatar
                            src={avatarSrc}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "primary.dark",
                                fontSize: 16,
                                fontWeight: 700,
                                border: "2px solid rgba(255,255,255,0.3)",
                            }}
                        >
                            {userInitials}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                        {user?.username || "USUARIO ANÓNIMO"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {user?.email || ""}
                                    </Typography>
                                </Box>
                                <IconButton onClick={handleDrawerToggle} sx={{ color: "inherit" }}>
                                    <CancelIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ px: 2, py: 1.5 }}>
                        <ConfigRow />
                    </Box>

                    <Divider />

                    <List sx={{ px: 2, pt: 1 }}>
                        {navItems.map((item) =>
                            "submenu" in item ? (
                                <DrawerSubmenuItem
                                    key={item.name}
                                    item={item}
                                    handleNavClick={handleNavClick}
                                    handleDrawerToggle={handleDrawerToggle}
                                />
                            ) : (
                                <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => {
                                            if (!item.href) return;
                                            handleNavClick(item.href);
                                            handleDrawerToggle();
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            "&:hover": { backgroundColor: "action.hover" },
                                        }}
                                    >
                                        {item.icon && (
                                            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                                        )}
                                        <ListItemText primary={item.name} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        )}
                    </List>
                </Box>

                <Divider />
                <Box sx={{ p: 2 }}>
                    <ListItemButton
                        onClick={logout}
                        sx={{
                            borderRadius: 2,
                            color: "error.main",
                            "&:hover": { backgroundColor: "action.hover" },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                            <ExitIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar sesión" />
                    </ListItemButton>
                </Box>
            </Box>
        </Drawer>
    );
}

function DrawerSubmenuItem({
    item,
    handleNavClick,
    handleDrawerToggle,
}: {
    item: NavItemWithSubmenu;
    handleNavClick: (href: string) => void;
    handleDrawerToggle: () => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                    onClick={() => setOpen(!open)}
                    sx={{
                        borderRadius: 2,
                        "&:hover": { backgroundColor: "action.hover" },
                    }}
                >
                    {item.icon && (
                        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    )}
                    <ListItemText primary={item.name} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 4 }}>
                    {item.submenu.map((sub: NavItem) => (
                        <ListItem key={sub.name} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    if (!sub.href) return;
                                    handleNavClick(sub.href);
                                    handleDrawerToggle();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    "&:hover": { backgroundColor: "action.hover" },
                                }}
                            >
                                <ListItemText
                                    primary={sub.name}
                                    primaryTypographyProps={{ variant: "body2" }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </>
    );
}
