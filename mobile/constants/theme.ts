/**
 * Sistema de diseño de SugarCheck (móvil).
 *
 * Los valores de color son un espejo de los temas Material-UI del frontend
 * (`frontend/src/stores/themesStore.tsx`) para mantener una identidad visual
 * idéntica entre web y app.
 *
 * Regla: los componentes NO deben usar colores hexadecimales sueltos. Todo
 * debe salir de `Colors[modo]` o de las variantes de `Typography`.
 */

import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface PaletteShade {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface PrimaryColor extends PaletteShade {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface SemanticColor {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface AccentColors {
  blue: string;
  softBlue: string;
  green: string;
  red: string;
  gray: string;
  muted: string;
}

export interface ThemeColors {
  mode: ThemeMode;
  primary: PrimaryColor;
  success: SemanticColor;
  error: SemanticColor;
  warning: SemanticColor;
  info: SemanticColor;
  background: {
    default: string;
    paper: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  divider: string;
  border: string;
  action: {
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
    focus: string;
  };
  /** Superficies tintadas para tarjetas destacadas (equivalente a primary.200). */
  surface: string;
  accent: AccentColors;
  /** Texto/icono sobre colores saturados (zonas, badges de estado, etc.). */
  onAccent: string;
  /** Alias móviles de compatibilidad. */
  tint: string;
  card: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  backgroundNavBar: string;
  inputBackground: string;
  overlay: string;
  shadow: string;
}

// 1. Paleta primaria (idéntica al frontend)
const lightPrimary: PrimaryColor = {
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

const darkPrimary: PrimaryColor = {
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

// 2. Tokens resueltos por modo
const lightColors: ThemeColors = {
  mode: 'light',
  primary: lightPrimary,
  success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#ffffff' },
  error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#ffffff' },
  warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100', contrastText: '#ffffff' },
  info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#ffffff' },
  background: {
    default: '#E4EFF7',
    paper: '#ffffff',
    elevated: '#ffffff',
  },
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    disabled: '#a0aec0',
    inverse: '#ffffff',
  },
  divider: '#e2e8f0',
  border: '#d7e7f3',
  action: {
    active: lightPrimary.main,
    hover: 'rgba(85, 142, 185, 0.08)',
    selected: 'rgba(85, 142, 185, 0.14)',
    disabled: '#a0aec0',
    disabledBackground: 'rgba(0, 0, 0, 0.08)',
    focus: 'rgba(85, 142, 185, 0.18)',
  },
  surface: '#d7e7f3',
  accent: {
    blue: '#7692A8',
    softBlue: '#94c2e6',
    green: '#4CAF50',
    red: '#FF5252',
    gray: '#5A5A5A',
    muted: '#666666',
  },
  onAccent: '#ffffff',
  tint: lightPrimary.main,
  card: '#ffffff',
  icon: '#4a5568',
  tabIconDefault: '#4a5568',
  tabIconSelected: lightPrimary.main,
  backgroundNavBar: '#d7e7f3',
  inputBackground: '#f2f7fb',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  mode: 'dark',
  primary: darkPrimary,
  success: { main: '#4caf50', light: '#81c784', dark: '#388e3c', contrastText: '#121212' },
  error: { main: '#f44336', light: '#e57373', dark: '#d32f2f', contrastText: '#121212' },
  warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00', contrastText: '#121212' },
  info: { main: '#29b6f6', light: '#4fc3f7', dark: '#0288d1', contrastText: '#121212' },
  background: {
    default: '#0d131a',
    paper: '#161f28',
    elevated: '#1b2733',
  },
  text: {
    primary: '#ffffff',
    secondary: '#afb9c3',
    disabled: '#66727f',
    inverse: '#121212',
  },
  divider: '#24323f',
  border: '#24323f',
  action: {
    active: darkPrimary.main,
    hover: 'rgba(149, 191, 223, 0.08)',
    selected: 'rgba(149, 191, 223, 0.16)',
    disabled: '#66727f',
    disabledBackground: 'rgba(255, 255, 255, 0.08)',
    focus: 'rgba(149, 191, 223, 0.18)',
  },
  surface: '#202e3a',
  accent: {
    blue: '#afcfe7',
    softBlue: '#95bfdf',
    green: '#81c784',
    red: '#ef5350',
    gray: '#e2e8f0',
    muted: '#afb9c3',
  },
  onAccent: '#ffffff',
  tint: darkPrimary.main,
  card: '#161f28',
  icon: '#afb9c3',
  tabIconDefault: '#afb9c3',
  tabIconSelected: darkPrimary.main,
  backgroundNavBar: '#161f28',
  inputBackground: '#202e3a',
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: '#000000',
};

export const Colors: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

// 3. Tipografía (idéntica a los tamaños MUI del frontend)
export const Fonts = {
  light: 'Poppins-Light',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
  // Alias de compatibilidad con el tema original de Expo.
  sans: 'Poppins-Regular',
  serif: 'Poppins-SemiBold',
  rounded: 'Poppins-Medium',
  mono: 'Poppins-Light',
} as const;

export const Typography = {
  h1: { fontFamily: Fonts.bold, fontSize: 88, lineHeight: 106, letterSpacing: 1.5 },
  h2: { fontFamily: Fonts.bold, fontSize: 57, lineHeight: 68, letterSpacing: 0.5 },
  h3: { fontFamily: Fonts.bold, fontSize: 48, lineHeight: 58, letterSpacing: 0 },
  h4: { fontFamily: Fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: 0.25 },
  h5: { fontFamily: Fonts.bold, fontSize: 23, lineHeight: 28, letterSpacing: 0 },
  h6: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 24, letterSpacing: 0.25 },
  subtitle1: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 21, letterSpacing: 0.15 },
  subtitle2: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  body1: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0.05 },
  body2: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, letterSpacing: 0.25 },
  button: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 21, letterSpacing: 1.25 },
  caption: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, letterSpacing: 0.4 },
  overline: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;

// 4. Geometría compartida con el frontend
export const Shape = {
  borderRadius: 8,
  cardRadius: 16,
  buttonRadius: 12,
  inputRadius: 8,
  modalRadius: 16,
} as const;

export const Spacing = 8;

/** Mantiene compatibilidad con código que importe `Fonts` esperando Platform.select. */
export const FontFamilies = Platform.select({
  ios: Fonts,
  default: Fonts,
  web: Fonts,
});
