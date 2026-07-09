import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'contained',
  color = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const getColors = () => {
    switch (color) {
      case 'primary':
        return { main: Colors[colorScheme].tint, contrast: '#fff' };
      case 'secondary':
        return { main: isDark ? '#555' : '#e0e0e0', contrast: isDark ? '#fff' : '#000' };
      case 'danger':
        return { main: '#d32f2f', contrast: '#fff' };
      default:
        return { main: Colors[colorScheme].tint, contrast: '#fff' };
    }
  };

  const theme = getColors();

  const containerStyle: ViewStyle =
    variant === 'contained'
      ? {
          backgroundColor: disabled ? '#999' : theme.main,
          borderWidth: 0,
        }
      : variant === 'outlined'
        ? {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: disabled ? '#999' : theme.main,
          }
        : {
            backgroundColor: 'transparent',
            borderWidth: 0,
          };

  const textColor = variant === 'contained' ? theme.contrast : disabled ? '#999' : theme.main;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, containerStyle, style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, marginLeft: icon ? 8 : 0 }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
});
