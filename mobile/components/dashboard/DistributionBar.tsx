import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import type { DashboardDistribution } from '@/src/hooks/useDashboardData';

interface DistributionBarProps {
  distribution: DashboardDistribution | null;
  labels: {
    low: string;
    inRange: string;
    high: string;
  };
}

export function DistributionBar({ distribution, labels }: DistributionBarProps) {
  const { colors } = useTheme();

  if (!distribution) {
    return (
      <ThemedText type="caption" muted style={styles.empty}>
        --
      </ThemedText>
    );
  }

  const segments = [
    { key: 'low', value: distribution.low, color: colors.error.main, label: labels.low },
    {
      key: 'inRange',
      value: distribution.inRange,
      color: colors.success.main,
      label: labels.inRange,
    },
    { key: 'high', value: distribution.high, color: colors.warning.main, label: labels.high },
  ].filter((segment) => segment.value > 0);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { backgroundColor: colors.divider }]}>
        {segments.map((segment) => (
          <View
            key={segment.key}
            style={[styles.segment, { width: `${segment.value}%`, backgroundColor: segment.color }]}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: segment.color }]} />
            <ThemedText type="caption" muted style={styles.legendLabel}>
              {segment.label} {segment.value}%
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  empty: {
    marginTop: 8,
    textAlign: 'center',
  },
});
