import * as React from "react";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// 1. Importamos useLocation y useNavigate de react-router-dom
import { useLocation, useNavigate } from "react-router-dom"; 
import type { NavItemWithSubmenu } from "../../types/types";

export const MenuSubItemComp = ({ item }: { item: NavItemWithSubmenu }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // 2. Inicializamos las herramientas de ruta
  const location = useLocation();
  const navigate = useNavigate();

  // 3. Verificamos si la URL actual coincide con alguno de los submenús de esta categoría
  const isAnySubmenuActive = item.submenu?.some(
    (sub) => sub.href === location.pathname
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función manejadora para navegar sin recargar la página entera
  const handleMenuClick = (href: string) => {
    handleClose();
    if (href) navigate(href);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={item.icon || <KeyboardArrowDownIcon />} // Usa el icono del item si existe, sino el de la flecha
        sx={{ 
          // COLOR CONDICIONAL: Si un submenú está activo, cambia el diseño del botón padre
          bgcolor: isAnySubmenuActive ? "primary.main" : "primary.light",
          color: "text.primary", 
          textTransform: "none", 
          fontWeight: isAnySubmenuActive ? 700 : 500,
          px: 2,
          py: 1,
          borderRadius: "4px",
          "&:hover": {
            bgcolor: "primary.main",
            opacity: 0.9
          }
        }}
      >
        <Typography 
          variant={"subtitle2"} 
          sx={{ color: "text.primary" }}
        >
          {item.name}
        </Typography>
      </Button>
      
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          
        {item.submenu.map((sub) => {
          // También podemos saber cuál opción específica del submenú está activa
          const isThisSubActive = location.pathname === sub.href;

          return (
            <MenuItem
              key={sub.name}
              onClick={() => handleMenuClick(sub.href || "")}
              sx={{
                // Estilo sutil para marcar cuál opción del desplegable está abierta actualmente
                fontWeight: isThisSubActive ? 700 : 400,
                color: "text.primary",
                bgcolor: isThisSubActive ? "action.selected" : "transparent"
              }}
            >
              {sub.name}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};