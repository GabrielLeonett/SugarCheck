import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getGlucoseStatusColor,
  type GlucoseRangeStatus,
} from '@/src/utils/glucoseRange';

export interface BarChartDatum {
  label: string;
  value: number;
  rangeStatus?: GlucoseRangeStatus;
}

interface BarChartMiniProps {
  data: BarChartDatum[];
  height?: number;
  emptyMessage?: string;
}

export function BarChartMini({
  data,
  height = 180,
  emptyMessage = 'Sin datos',
}: BarChartMiniProps) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <ThemedText type="body2" muted style={styles.emptyText}>
          {emptyMessage}
        </ThemedText>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((entry) => entry.value), 1);
  const plotHeight = Math.max(60, height - 48);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((entry, index) => (
        <View key={`${entry.label}-${index}`} style={styles.column}>
          <ThemedText type="caption" style={[styles.value, { color: colors.text.secondary }]}>
            {entry.value}
          </ThemedText>
          <View style={styles.plot}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(6, (entry.value / maxValue) * plotHeight),
                  backgroundColor: entry.rangeStatus
                    ? getGlucoseStatusColor(entry.rangeStatus, colors)
                    : colors.accent.softBlue,
                },
              ]}
            />
          </View>
          <ThemedText type="caption" muted numberOfLines={1} style={styles.label}>
            {entry.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  value: {
    fontSize: 11,
    marginBottom: 4,
  },
  plot: {
    flex: 1,
    width: '100%',
    maxWidth: 36,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
