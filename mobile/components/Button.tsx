import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'danger';

export type ButtonVariant = 'contained' | 'outlined' | 'text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'contained',
  color = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const semanticColor = getSemanticColor(color, colors);
  const isSecondary = color === 'secondary';

  const mainColor = isSecondary ? colors.text.primary : semanticColor?.main ?? colors.primary.main;
  const contrastColor = isSecondary
    ? colors.text.inverse
    : semanticColor?.contrastText ?? colors.primary.contrastText;
  const secondaryBackground = colors.surface;

  const containerStyle: ViewStyle =
    variant === 'contained'
      ? {
          backgroundColor: isDisabled
            ? colors.action.disabledBackground
            : isSecondary
              ? secondaryBackground
              : mainColor,
          borderWidth: 0,
        }
      : variant === 'outlined'
        ? {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? colors.action.disabled : isSecondary ? colors.border : mainColor,
          }
        : {
            backgroundColor: 'transparent',
            borderWidth: 0,
          };

  const textColor = isDisabled
    ? colors.action.disabled
    : variant === 'contained'
      ? contrastColor
      : isSecondary
        ? colors.text.primary
        : mainColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, fullWidth && styles.fullWidth, containerStyle, style]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'contained' ? contrastColor : mainColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, marginLeft: icon ? 8 : 0 }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getSemanticColor(
  color: ButtonColor,
  colors: ReturnType<typeof useTheme>['colors']
) {
  switch (color) {
    case 'success':
      return colors.success;
    case 'error':
    case 'danger':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'info':
      return colors.info;
    case 'primary':
      return colors.primary;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Shape.buttonRadius,
    minHeight: 48,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  text: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    letterSpacing: 1.25,
  },
});
