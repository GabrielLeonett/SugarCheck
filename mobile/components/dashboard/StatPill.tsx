import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface StatPillProps {
  label: string;
  value: string;
  /** Color del valor; por defecto el texto principal. */
  color?: string;
}

export function StatPill({ label, value, color }: StatPillProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: colors.background.default }]}>
      <ThemedText type="caption" muted style={styles.label} numberOfLines={1}>
        {label}
      </ThemedText>
      <ThemedText
        style={[styles.value, { color: color ?? colors.text.primary }]}
        numberOfLines={1}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minWidth: 64,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    gap: 1,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Fonts.semiBold,
  },
});
