import { IconButton, AppBar, Box, Toolbar, Typography, Avatar, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationIcon from "@mui/icons-material/Notifications";
import type { NavItemWithSubmenu } from "../../../types/types";

// ✅ Import correcto del contexto
import { Logo } from "../../ui/Logo";
import DrawerAppBar from "./Drawer";
import { MenuSubItemComp } from "../../ui/MenuSubItemComp";
import NavBarItem from "../../ui/NavBarItem";
import ProfileNavBar from "../../ui/Cards/ProfileNavBar";
import { useNavbar } from "../../../hooks/useNavbar";
import { useProfileAvatar } from "../../../hooks/useProfileAvatar";

function Navbar() {
  const {avatarSelected} = useProfileAvatar();
  const {
    isDarkMode, toggleTheme,
    profileMenuOpen, setProfileMenuOpen, navItems,
    handleDrawerToggle, handleNavClick, userInitials, drawerOpen
  } = useNavbar();
 
  // no mira esto tiene un hook especial
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
                <NavBarItem key={item.name} item={item as NavItemWithSubmenu} />
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
            <Avatar alt="User" src={avatarSelected} children={userInitials} sx={{
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
