/**
 * Colores y tipografía sincronizados con el frontend (MUI Theme).
 */

import { Platform } from 'react-native';

const tintColorLight = '#95BFDF';
const tintColorDark = '#95bfdf';

export const Colors = {
  light: {
    text: '#1a202c',
    background: '#E4EFF7',
    backgroundNavBar: '#d7e7f3',
    tint: tintColorLight,
    icon: '#4a5568',
    tabIconDefault: '#4a5568',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#0d131a',
    backgroundNavBar: '#161f28',
    tint: tintColorDark,
    icon: '#afb9c3',
    tabIconDefault: '#afb9c3',
    tabIconSelected: tintColorDark,
  },
};

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