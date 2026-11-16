import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { DashboardBattle } from '@/src/hooks/useDashboardData';
import { getGlucoseStatusColor } from '@/src/utils/glucoseRange';

interface BattleRowProps {
  battle: DashboardBattle;
  /** Etiqueta del estado de la lectura (En rango, Baja, Alta…). */
  statusLabel: string;
}

export function BattleRow({ battle, statusLabel }: BattleRowProps) {
  const { colors } = useTheme();
  const color = getGlucoseStatusColor(battle.rangeStatus, colors);

  return (
    <View style={[styles.row, { borderTopColor: colors.divider }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />

      <View style={styles.main}>
        <ThemedText style={[styles.level, { color }]}>
          {battle.nivel}
          <ThemedText type="caption" muted style={styles.unit}>
            {' '}
            mg/dL
          </ThemedText>
        </ThemedText>
        <ThemedText type="caption" muted style={styles.meta} numberOfLines={1}>
          {battle.contexto ? `${statusLabel} · ${battle.contexto}` : statusLabel}
        </ThemedText>
      </View>

      <ThemedText type="caption" muted style={styles.time}>
        {battle.hora}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  main: {
    flex: 1,
    gap: 1,
  },
  level: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.semiBold,
  },
  unit: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  meta: {
    fontSize: 11,
    lineHeight: 15,
  },
  time: {
    fontSize: 11,
    lineHeight: 15,
  },
});
