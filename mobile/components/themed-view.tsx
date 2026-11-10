import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'paper' | 'elevated' | 'surface' | 'transparent';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  const { colors, colorScheme } = useTheme();
  const customColor = colorScheme === 'dark' ? darkColor : lightColor;

  const backgroundColor = customColor ?? getBackgroundColor(variant);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;

  function getBackgroundColor(selectedVariant: ThemedViewProps['variant']) {
    switch (selectedVariant) {
      case 'paper':
        return colors.background.paper;
      case 'elevated':
        return colors.background.elevated;
      case 'surface':
        return colors.surface;
      case 'transparent':
        return 'transparent';
      default:
        return colors.background.default;
    }
  }
}
