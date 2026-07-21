/**
 * Configuración completa de colores, paletas y tipografía para React Native,
 * sincronizada exactamente con el archivo de temas de Material-UI (Frontend).
 */

import { Platform } from 'react-native';

// 1. Paleta Primaria para Modo Claro
const lightPrimary = {
  main: '#95BFDF',
  light: '#7aafd7',
  dark: '#3d586c',
  contrastText: '#ffffff',
  50: '#f2f7fb',
  100: '#e4eff7',
  200: '#d7e7f3',
  300: '#cadfef',
  400: '#afcfe7',
  500: '#558eb9',
  600: '#46779c',
  700: '#385f7d',
  800: '#2a475e',
  900: '#18232b',
};

// 2. Paleta Primaria para Modo Oscuro
const darkPrimary = {
  main: '#95bfdf',
  light: '#bfe0f7',
  dark: '#2a475e',
  contrastText: '#121212',
  50: '#18232b',
  100: '#202e3a',
  200: '#2a475e',
  300: '#3d586c',
  400: '#557b97',
  500: '#95bfdf',
  600: '#afcfe7',
  700: '#cadfef',
  800: '#d7e7f3',
  900: '#f2f7fb',
};

// 3. Objeto completo Colors listo para React Native
export const Colors = {
  light: {
    mode: 'light' as const,
    primary: lightPrimary,
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#ffffff' },
    error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#ffffff' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100', contrastText: '#ffffff' },
    info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#ffffff' },
    background: { default: '#E4EFF7', paper: '#ffffff' },
    text: { primary: '#1a202c', secondary: '#4a5568', disabled: '#a0aec0' },
    divider: '#e2e8f0',
    // Propiedades adicionales de compatibilidad móvil (Navigation/UI)
    tint: lightPrimary.main,
    backgroundNavBar: '#d7e7f3', // Equivalente a lightPrimary[200]
    card: '#ffffff',
    icon: '#4a5568',
    tabIconDefault: '#4a5568',
    tabIconSelected: lightPrimary.main,
    shadowColor: '#000000',
  },
  dark: {
    mode: 'dark' as const,
    primary: darkPrimary,
    success: { main: '#4caf50', light: '#81c784', dark: '#388e3c', contrastText: '#121212' },
    error: { main: '#f44336', light: '#e57373', dark: '#d32f2f', contrastText: '#121212' },
    warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00', contrastText: '#121212' },
    info: { main: '#29b6f6', light: '#4fc3f7', dark: '#0288d1', contrastText: '#121212' },
    background: { default: '#0d131a', paper: '#161f28' },
    text: { primary: '#ffffff', secondary: '#afb9c3', disabled: '#66727f' },
    divider: '#24323f',
    // Propiedades adicionales de compatibilidad móvil (Navigation/UI)
    tint: darkPrimary.main,
    backgroundNavBar: '#161f28',
    card: '#161f28',
    icon: '#afb9c3',
    tabIconDefault: '#afb9c3',
    tabIconSelected: darkPrimary.main,
    shadowColor: '#000000',
  },
};

// 4. Configuración de Tipografía sincronizada con Poppins
export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins-Regular',
    serif: 'Poppins-SemiBold',
    rounded: 'Poppins-Medium',
    mono: 'Poppins-Light',
  },
  default: {
    sans: 'Poppins-Regular',
    serif: 'Poppins-SemiBold',
    rounded: 'Poppins-Medium',
    mono: 'Poppins-Light',
  },
  web: {
    sans: "'Poppins', system-ui, -apple-system, sans-serif",
    serif: "'Poppins', Georgia, serif",
    rounded: "'Poppins', sans-serif",
    mono: "'Poppins', monospace",
  },
});