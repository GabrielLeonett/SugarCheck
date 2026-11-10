import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.paper,
          borderColor: colors.border,
          borderWidth: variant === 'outlined' ? StyleSheet.hairlineWidth : 0,
          elevation: variant === 'elevated' ? 2 : 0,
          boxShadow: variant === 'elevated'
            ? `0px 2px 8px ${isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'}`
            : 'none',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: Shape.cardRadius,
    marginVertical: 8,
  },
});
