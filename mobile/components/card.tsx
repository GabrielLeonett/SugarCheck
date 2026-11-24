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
  const isElevated = variant === 'elevated';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.paper,
          borderColor: colors.border,
          borderWidth: variant === 'outlined' ? StyleSheet.hairlineWidth : 0,
        },
        isElevated && {
          elevation: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 8,
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
