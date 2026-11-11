import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';

const MIN_IMC = 15;
const MAX_IMC = 35;

/** Posición de los cortes clínicos sobre el riel. */
const UNDERWEIGHT_PCT = ((18.5 - MIN_IMC) / (MAX_IMC - MIN_IMC)) * 100;
const NORMAL_PCT = ((25 - MIN_IMC) / (MAX_IMC - MIN_IMC)) * 100;

interface ImcGaugeProps {
  imc: number | null;
}

export function ImcGauge({ imc }: ImcGaugeProps) {
  const { colors } = useTheme();

  const percent =
    imc === null
      ? null
      : ((Math.min(Math.max(imc, MIN_IMC), MAX_IMC) - MIN_IMC) / (MAX_IMC - MIN_IMC)) * 100;

  return (
    <View style={styles.wrapper}>
      <View style={styles.rail}>
        <View style={[styles.track, { backgroundColor: colors.divider }]}>
          <View
            style={[
              styles.segment,
              { width: `${UNDERWEIGHT_PCT}%`, backgroundColor: colors.error.main },
            ]}
          />
          <View
            style={[
              styles.segment,
              {
                width: `${NORMAL_PCT - UNDERWEIGHT_PCT}%`,
                backgroundColor: colors.success.main,
              },
            ]}
          />
          <View style={[styles.segment, styles.segmentLast, { backgroundColor: colors.warning.main }]} />
        </View>

        {percent !== null ? (
          <View
            style={[
              styles.thumb,
              {
                left: `${percent}%`,
                backgroundColor: colors.background.paper,
                borderColor: colors.accent.blue,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.labels}>
        <View style={styles.labelCell}>
          <ThemedText type="caption" muted style={styles.labelText}>
            Bajo peso
          </ThemedText>
        </View>
        <View style={styles.labelCell}>
          <ThemedText type="caption" muted style={styles.labelText}>
            Normal
          </ThemedText>
        </View>
        <View style={styles.labelCell}>
          <ThemedText type="caption" muted style={styles.labelText}>
            Sobrepeso
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  rail: {
    height: 18,
    justifyContent: 'center',
  },
  track: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  segmentLast: {
    flex: 1,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    borderWidth: 3,
  },
  labels: {
    flexDirection: 'row',
    marginTop: 8,
  },
  labelCell: {
    flex: 1,
  },
  labelText: {
    fontSize: 10,
    textAlign: 'center',
  },
});
