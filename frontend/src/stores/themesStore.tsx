import { createTheme } from "@mui/material/styles";

// 1. Definimos los colores primarios compartidos en un objeto limpio
const primaryPalette = {
  main: "#7aafd7",
  light: "#afcfe7",
  dark: "#3d586c",
  contrastText: "#ffffff",
  50: "#f2f7fb",
  100: "#e4eff7",
  200: "#d7e7f3",
  300: "#cadfef",
  400: "#afcfe7",
  500: "#7aafd7",
  600: "#6e9ec2",
  700: "#557b97",
  800: "#3d586c",
  900: "#18232b",
};

// 2. Base de configuración común (sin la paleta para evitar colisiones)
const baseThemeConfig = {
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontSize: 88, fontWeight: 700, lineHeight: 1.2, letterSpacing: 1.5 },
    h2: { fontSize: 57, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.5 },
    h3: { fontSize: 48, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    h4: { fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.25 },
    h5: { fontSize: 23, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    h6: { fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.25 },
    subtitle1: { fontSize: 15, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0.15 },
    subtitle2: { fontSize: 14, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0.1 },
    body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0.05 },
    body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0.25 },
    button: { fontSize: 14, fontWeight: 500, lineHeight: 1.5, textTransform: "none" as const, letterSpacing: 1.25 },
    caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.4 },
    overline: { fontSize: 12, fontWeight: 500, lineHeight: 1.4, textTransform: "uppercase" as const, letterSpacing: 2 },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": {
          fontFamily: "Poppins",
          fontStyle: "normal",
        },
        html: { scrollBehavior: "smooth" as const },
        body: { transition: "background-color 0.3s ease, color 0.3s ease" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none" as const,
          fontWeight: 500,
          padding: "12px",
          fontSize: 14,
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
          "&:hover": { transform: "translateY(-1px)" },
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

// 3. Tema Claro Completado
export const lightTheme = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: "light",
    primary: primaryPalette, // Inyectamos la paleta aquí
    success: { main: "#2e7d32", light: "#4caf50", dark: "#1b5e20" },
    error: { main: "#d32f2f", light: "#ef5350", dark: "#c62828" },
    warning: { main: "#ed6c02", light: "#ff9800", dark: "#e65100" },
    info: { main: "#0288d1", light: "#03a9f4", dark: "#01579b" },
    background: { default: "#E4EFF7", paper: "#ffffff" },
    text: { primary: "#1a202c", secondary: "#4a5568", disabled: "#a0aec0" },
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

// 4. Tema Oscuro Completado
export const darkTheme = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: "dark",
    primary: primaryPalette, // Inyectamos la paleta aquí también
    success: { main: "#2e7d32", light: "#4caf50", dark: "#1b5e20" },
    error: { main: "#f44336", light: "#ef5350", dark: "#c62828" },
    warning: { main: "#ff9800", light: "#ffb74d", dark: "#f57c00" },
    info: { main: "#29b6f6", light: "#4fc3f7", dark: "#0288d1" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#ffffff", secondary: "#b0b0b0", disabled: "#666666" },
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