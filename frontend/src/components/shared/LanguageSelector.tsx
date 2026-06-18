import React, { useState } from "react";
import { Menu, Box, MenuItem, IconButton, Typography } from "@mui/material";
import useLanguage from "../../hooks/useLanguage";

const LanguageSelector = () => {
  const { currentLanguage, currentLanguageInfo, changeLanguage, languages } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    handleClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "text.primary",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          padding: 1,
        }}
        aria-label="Select language"
        aria-controls={isMenuOpen ? "language-icon-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen ? "true" : undefined}
      >
        {/* CORREGIDO: El icono es una ruta string de SVG, se debe renderizar en una etiqueta de imagen */}
        {currentLanguageInfo?.icon ? (
          <Box
            component="img"
            src={currentLanguageInfo.icon}
            alt={currentLanguageInfo.name}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "2px",
              objectFit: "contain",
            }}
          />
        ) : (
          /* Fallback con el emoji de la bandera por si el SVG no carga */
          <Typography variant="body2">{currentLanguageInfo?.flag}</Typography>
        )}
      </IconButton>

      <Menu
        id="language-icon-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        // Previene comportamientos extraños de padding en menús con elementos densos
        disableScrollLock
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              px: 2,
            }}
            dense
          >
            <Box
              component="span"
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
              }}
            >
              {language.icon && (
                <Box
                  component="img"
                  src={language.icon}
                  alt={language.name}
                  sx={{
                    width: 18,
                    height: 18,
                    mr: 1.5,
                    borderRadius: "2px",
                    objectFit: "contain",
                  }}
                />
              )}
              {/* Nota: Dejé el flag por si quieres mantener ambos, 
                  pero si ya usas el SVG (icon), podrías borrar esta línea de la bandera en emoji */}
              <Typography variant="body2" component="span" sx={{ mr: 1.5 }}>
                {language.flag}
              </Typography>
              <Typography variant="body2" component="span" sx={{ fontWeight: currentLanguage === language.code ? 'bold' : 'normal' }}>
                {language.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default React.memo(LanguageSelector);