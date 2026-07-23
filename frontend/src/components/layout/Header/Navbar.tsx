import { IconButton, AppBar, Box, Toolbar, Typography, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import type { NavItemWithSubmenu } from "../../../types/types";

// ✅ Import correcto del contexto
import { Logo } from "../../ui/Logo";
import DrawerAppBar from "./Drawer";
import { MenuSubItemComp } from "../../ui/MenuSubItemComp";
import NavBarItem from "../../ui/NavBarItem";
import ProfileNavBar from "../../ui/Cards/ProfileNavBar";
import { useNavbar } from "../../../hooks/useNavbar";
import { usePreferenceConfig } from "../../../hooks/usePreferenceConfig";
import { AVATAR_MAP } from "../../../constants/avatars";
import NotificationsDropdown from "../../shared/NotificationsDropdown";


function Navbar() {
  const {preference} = usePreferenceConfig();
  const avatarSrc = preference?.profileImg && AVATAR_MAP[preference.profileImg]
    ? AVATAR_MAP[preference.profileImg]
    : undefined;

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
          <Box component={'a'} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, textDecoration: 'none' }} href="/">
            <Logo />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'center' }}>
              <Typography
                variant="h6"
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
            <NotificationsDropdown />
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <Avatar alt="User" src={avatarSrc} children={userInitials} sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                },
              }} />
            </Box>
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
