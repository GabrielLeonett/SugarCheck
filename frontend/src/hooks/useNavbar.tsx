import HomeIcon from "@mui/icons-material/Home";
import React from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import type { NavItemType } from "../types/types";
import MenuIcon from '@mui/icons-material/Menu'
import { useAuthStore } from "../stores/authStore";
import useLanguage from "./useLanguage";


export function useNavbar() {
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
    }, {
        name: t("analisis"), submenu: [
            { name: t("analisisDeDatos"), href: "/analisis/control-de-glucemia" },
            { name: t("dosisDeInsulina"), href: "/analisis/registro-de-alimentos" },
            { name: t("condicionFisica"), href: "/analisis/registro-de-ejercicio" }]
        , icon: <MenuIcon />
    },
    {
        name: t("agente"), submenu: [
            { name: t("consultarAlOraculo"), href: "/agente/oraculo-chat" },
            { name: t("rutaDelGuerrero"), href: "/agente/registro-de-alimentos" },
        ]
        , icon: <MenuIcon />
    }];

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleNavClick = (href: string) => {
        setDrawerOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const userInitials = React.useMemo(() => {
        if (!user) return "";
        const names = user.name.split(" ");
        console.log("User Name:", user.name);
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