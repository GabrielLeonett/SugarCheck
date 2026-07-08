import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import React from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import type { NavItemType } from "../types/types";
import MenuIcon from '@mui/icons-material/Menu'
import { useAuthStore } from "../stores/authStore";
import useLanguage from "./useLanguage";


export function useNavbar() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
    const user = useAuthStore((state) => state.user);
    const { t } = useLanguage("nav");
    const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const navItems: NavItemType[] = [{ name: t("inicio"), href: "/", icon: <HomeIcon /> }, {
        name: t("bitacora"), submenu: [
            { name: t("controlDeGlucemia"), href: "/bitacora/control-glucosa" },
            { name: t("dosisDeInsulina"), href: "/bitacora/dosis-insulina" },
            { name: t("condicionFisica"), href: "/bitacora/monitoreo-fisico" }]
        , icon: <MenuIcon />
    }, 
    {
        name: t("agente"), submenu: [
<<<<<<< HEAD
            { name: t("consultarAlOraculo"), href: "/agente/oraculo-chat" },
            { name: t("rutaDelGuerrero"), href: "/agente/registro-de-alimentos" },
=======
            { name: t("consultarAlOraculo"), href: "/agente/control-de-go-de-lucemia" }, 
            { name: t("rutaDelGuerrero"), href: "/agente/camino" },
>>>>>>> 4df533bce7f4bdf0172f34d73e2bdbdb5fe6c12b
        ]
        , icon: <MenuIcon />
    }];

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleNavClick = (href: string) => {
        setDrawerOpen(false);
        navigate(href);
    };

    const userInitials = React.useMemo(() => {
        if (!user) return "";
        const names = user.username.split(" ");
        console.log("User Name:", user.username);
        const initials = names.map(name => name[0]).join("");
        return initials.toUpperCase();
    }, [user])

    return {
        isDarkMode, toggleTheme,
        profileMenuOpen, setProfileMenuOpen, navItems,
        handleDrawerToggle, handleNavClick, userInitials,
        setDrawerOpen, drawerOpen
    }
}