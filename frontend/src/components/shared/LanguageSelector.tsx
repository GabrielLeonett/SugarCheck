import React, { useState } from "react";
import {
  Menu,
  Box,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import useLanguage from "../../hooks/useLanguage";

const LanguageSelector = ({ variant = "icon" }) => {
  const { currentLanguage, currentLanguageInfo, changeLanguage, languages } =
    useLanguage();
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

  if (variant === "button") {
    return (
      <>
        <Button
          startIcon={<LanguageIcon />}
          onClick={handleClick}
          sx={{
            color: "text.primary",
            textTransform: "none",
            fontWeight: 500,
            minWidth: "auto",
          }}
          aria-controls={isMenuOpen ? "language-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? "true" : undefined}
        >
          {currentLanguageInfo?.name}
        </Button>
        <Menu
          id="language-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleClose}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              selected={currentLanguage === language.code}
              aria-current={
                currentLanguage === language.code ? "true" : "false"
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Typography variant="h6">{language.flag}</Typography>
              </ListItemIcon>
              <ListItemText primary={language.name} />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Variante icon (default)
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
        <LanguageIcon />
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
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              backgroundColor: currentLanguage === language.code ? 'action.selected' : 'inherit',
              display: "flex",
              justifyContent: "space-between"
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
                    width: 20,
                    height: 20,
                    mr: 1.5,
                    borderRadius: "2px",
                    objectFit: "contain",
                  }}
                />
              )}
              <Typography variant="body2" component="span" sx={{ mr: 1.5 }}>
                {language.flag}
              </Typography>
              <Typography variant="body2" component="span">
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