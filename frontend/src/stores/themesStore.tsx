import { createTheme } from "@mui/material/styles";

const baseTheme = {
  typography: {
    fontFamily: '"Poppins", "Arial", sans-serif',
    h1: {
      fontSize: 88,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 57,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 48,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: 34,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: 23,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: "none",
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: 11,
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 8, // 8px es más estándar que 2
  },
  spacing: 8, // 8px unidad base (default de MUI)

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": {
          fontFamily: "Poppins",
          fontStyle: "normal",
          fontDisplay: "swap",
          fontWeight: "400",
          src: `
            local('Poppins'),
            local('Poppins-Regular'),
            url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap')
          `,
        },
        html: {
          scrollBehavior: "smooth",
        },
        body: {
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          padding: "8px 16px",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        },
        contained: {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 8px 16px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "16px 0 0 16px",
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      // Propiedades principales de MUI
      main: "#7aafd7",          // Tu color base original
      light: "#afcfe7",         // Equivalente al paso 400 (Clarito)
      dark: "#3d586c",          // Equivalente al paso 500 de sombras (Oscuro)
      contrastText: "#ffffff",  // Contraste blanco ideal para este tono de azul

      // Mapeo completo de la escala numérica (Tints y Shades)
      50: "#f2f7fb",   // tint 900
      100: "#e4eff7",  // tint 800
      200: "#d7e7f3",  // tint 700
      300: "#cadfef",  // tint 600
      400: "#afcfe7",  // tint 400
      500: "#7aafd7",  // BASE (main)
      600: "#6e9ec2",  // shade 100
      700: "#557b97",  // shade 300
      800: "#3d586c",  // shade 500
      900: "#18232b",  // shade 800
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100",
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b",
    },
    background: {
      default: "#E4EFF7",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a202c",
      secondary: "#4a5568",
      disabled: "#a0aec0",
    },
    divider: "#e2e8f0",
    action: {
      active: "#7AAFD7",
      hover: "rgba(28, 117, 186, 0.04)",
      hoverOpacity: 0.04,
      selected: "rgba(28, 117, 186, 0.08)",
      selectedOpacity: 0.08,
      disabled: "#a0aec0",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(28, 117, 186, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      // Propiedades principales de MUI
      main: "#7aafd7",          // Tu color base original
      light: "#afcfe7",         // Equivalente al paso 400 (Clarito)
      dark: "#3d586c",          // Equivalente al paso 500 de sombras (Oscuro)
      contrastText: "#ffffff",  // Contraste blanco ideal para este tono de azul

      // Mapeo completo de la escala numérica (Tints y Shades)
      50: "#f2f7fb",   // tint 900
      100: "#e4eff7",  // tint 800
      200: "#d7e7f3",  // tint 700
      300: "#cadfef",  // tint 600
      400: "#afcfe7",  // tint 400
      500: "#7aafd7",  // BASE (main)
      600: "#6e9ec2",  // shade 100
      700: "#557b97",  // shade 300
      800: "#3d586c",  // shade 500
      900: "#18232b",  // shade 800
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
    },
    error: {
      main: "#f44336",
      light: "#ef5350",
      dark: "#c62828",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    info: {
      main: "#29b6f6",
      light: "#4fc3f7",
      dark: "#0288d1",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
      disabled: "#666666",
    },
    divider: "#333333",
    action: {
      active: "#95BFDF",
      hover: "rgba(28, 117, 186, 0.08)",
      hoverOpacity: 0.08,
      selected: "rgba(28, 117, 186, 0.16)",
      selectedOpacity: 0.16,
      disabled: "#666666",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(28, 117, 186, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
});