import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, Typography, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedTextType =
  | TypographyVariant
  | 'default'
  | 'defaultSemiBold'
  | 'title'
  | 'subtitle'
  | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
  muted?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  muted = false,
  ...rest
}: ThemedTextProps) {
  const { colors, colorScheme } = useTheme();
  const customColor = colorScheme === 'dark' ? darkColor : lightColor;

  const variantStyle = getVariantStyle(type);
  const defaultColor = muted
    ? colors.text.secondary
    : type === 'link'
      ? colors.primary.main
      : colors.text.primary;

  return (
    <Text
      style={[variantStyle, { color: customColor ?? defaultColor }, style]}
      {...rest}
    />
  );
}

function getVariantStyle(type: ThemedTextType) {
  switch (type) {
    case 'default':
      return Typography.body1;
    case 'defaultSemiBold':
      return styles.defaultSemiBold;
    case 'title':
      return Typography.h4;
    case 'subtitle':
      return Typography.h6;
    case 'link':
      return Typography.body1;
    default:
      return Typography[type];
  }
}

const styles = StyleSheet.create({
  defaultSemiBold: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
});
