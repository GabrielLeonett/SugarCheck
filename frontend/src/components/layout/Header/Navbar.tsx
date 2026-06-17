import { IconButton, AppBar, Box, Toolbar, Typography, Avatar, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationIcon from "@mui/icons-material/Notifications";
<<<<<<< HEAD
import type { NavItemType, NavItemWithSubmenu, NavItem } from "../../../types/types";
=======
import type { NavItemWithSubmenu } from "../../../types/types";

>>>>>>> ab6175847f74da8fd798768baaa0d5bb3f27029e
// ✅ Import correcto del contexto
import { Logo } from "../../ui/logo";
import DrawerAppBar from "./Drawer";
import { MenuSubItemComp } from "../../ui/MenuSubItemComp";
import NavBarItem from "../../ui/NavBarItem";
import ProfileNavBar from "../../ui/Cards/ProfileNavBar";
import { useNavbar } from "../../../hooks/useNavbar";

function Navbar() {
<<<<<<< HEAD
  const user = useAuthStore((state) => state.user);
  const { t } = useLanguage("nav");
  // ✅ Corrección: usar isDarkMode en lugar de theme
  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navItems: NavItemType[] = [{ name: t("inicio"), href: "/", icon: <HomeIcon /> }, {
    name: t("bitacora"), submenu: [
      { name: t("controlDeGlucemia"), href: "/bitacora/control-de-glucosa" },
      { name: t("dosisDeInsulina"), href: "/bitacora/registro-de-alimentos" },
      { name: t("condicionFisica"), href: "/bitacora/registro-de-ejercicio" }] as NavItem[]
    , icon: <MenuIcon />
  }, {
    name: t("analisis"), submenu: [
      { name: t("analisisDeDatos"), href: "/bitacora/control" },
      { name: t("dosisDeInsulina"), href: "/bitacora/registro" },
      { name: t("condicionFisica"), href: "/bitacora/registro" }] as NavItem[]
    , icon: <MenuIcon />
  },
  {
    name: t("agente"), submenu: [
      { name: t("consultarAlOraculo"), href: "/bitacora/control" },
      { name: t("rutaDelGuerrero"), href: "/bitacora/registro" },
    ] as NavItem[]
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
=======
  const {
    isDarkMode, toggleTheme,
    profileMenuOpen, setProfileMenuOpen, navItems,
    handleDrawerToggle, handleNavClick, userInitials, drawerOpen
  } = useNavbar();
>>>>>>> ab6175847f74da8fd798768baaa0d5bb3f27029e

  return (
    <>
      <AppBar
        component="nav"
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 3, md: 4 },
            backgroundColor: "primary.light",
          }}
        >
          <Box component={'a'} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }} href="/">
            <Logo />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography
                variant="h6"
                component={"a"}
                href="#"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                SugarCheck
              </Typography>
              <Typography
                variant={"caption"}
                component="a"
                href="#"
                sx={{
                  fontWeight: 400,
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                Tu Control de Diabetes
              </Typography>
            </Box>
          </Box>

          {/* Menú desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 10, alignItems: "center" }}>
            {navItems.map((item) => (
              "submenu" in item ? (
                <MenuSubItemComp key={item.name} item={item as NavItemWithSubmenu} />
              ) : (
                <NavBarItem key={item.name} item={item} />
              )
            ))}
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              p: 1,
            }}
          >
            <Badge badgeContent={4} color="secondary">
              <NotificationIcon />
            </Badge>
            <Avatar alt="User" children={userInitials} sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                borderRadius: 1,
                cursor: "pointer", // Opcional, para indicar que es interactivo
              },
            }}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)} />
          </Box>

          {/* Menú hamburguesa */}
          < Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "text.primary",
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar >

      {/* Drawer móvil */}
      < DrawerAppBar
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
        handleNavClick={handleNavClick}
        navItems={navItems}
      />

      <Toolbar />

      <ProfileNavBar open={profileMenuOpen}></ProfileNavBar>
    </>
  );
}

export default Navbar;
