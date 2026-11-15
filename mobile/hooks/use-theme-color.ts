import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/constants/theme';

/**
 * Hook de compatibilidad para componentes que necesitan un color del tema.
 * Para código nuevo se recomienda usar `useTheme().colors` directamente.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const { colors, colorScheme } = useTheme();
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const color = colors[colorName];

  if (typeof color === 'string') {
    return color;
  }

  // Compatibilidad con la API plana anterior de Expo.
  if (colorName === 'text') {
    return colors.text.primary;
  }

  if (colorName === 'background') {
    return colors.background.default;
  }

  return colors.primary.main;
}
