import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface TrendBadgeProps {
  /** Diferencia contra la referencia. `null` cuando no hay con qué comparar. */
  delta: number | null;
  /** Texto que acompaña al número (p. ej. `mg/dL`). */
  suffix?: string;
  /**
   * Cómo interpretar el signo:
   * - `up`: subir es bueno (verde) y bajar es malo (rojo).
   * - `down`: bajar es bueno (verde) y subir es malo (rojo).
   * - `none`: informativo, sin juicio de valor.
   */
  goodDirection?: 'up' | 'down' | 'none';
  /** Etiqueta cuando la diferencia es exactamente cero. */
  flatLabel?: string;
  /** Etiqueta cuando no hay datos de comparación. */
  emptyLabel?: string;
}

export function TrendBadge({
  delta,
  suffix = '',
  goodDirection = 'none',
  flatLabel = 'Sin cambio',
  emptyLabel = 'Sin comparación',
}: TrendBadgeProps) {
  const { colors } = useTheme();

  if (delta === null || Number.isNaN(delta)) {
    return (
      <View style={styles.row}>
        <ThemedText type="caption" muted style={styles.value}>
          {emptyLabel}
        </ThemedText>
      </View>
    );
  }

  const rounded = Math.round(delta * 10) / 10;
  const isFlat = rounded === 0;
  const isUp = rounded > 0;

  const color = isFlat
    ? colors.text.disabled
    : goodDirection === 'none'
      ? isUp
        ? colors.warning.main
        : colors.accent.blue
      : (goodDirection === 'up') === isUp
        ? colors.success.main
        : colors.error.main;

  const Icon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <View style={styles.row}>
      <Icon size={14} color={color} strokeWidth={2.6} />
      <ThemedText style={[styles.value, { color }]}>
        {isFlat ? flatLabel : `${isUp ? '+' : ''}${rounded}${suffix}`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  value: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.semiBold,
  },
});
