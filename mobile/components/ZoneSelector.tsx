import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ZONAS_INYECCION } from '@/src/types';

interface ZoneSelectorProps {
  selectedZone: string;
  onSelectZone: (zoneKey: string) => void;
}

export function ZoneSelector({ selectedZone, onSelectZone }: ZoneSelectorProps) {
  const { colors } = useTheme();
  const [vista, setVista] = useState<'FRENTE' | 'ATRAS'>('FRENTE');
  const zonas = ZONAS_INYECCION[vista];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Zona de inyección</Text>

        <View style={[styles.toggleRow, { borderColor: colors.divider }]}>
          {(['FRENTE', 'ATRAS'] as const).map((option) => {
            const isActive = vista === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.toggleBtn, isActive && { backgroundColor: colors.primary.main }]}
                onPress={() => setVista(option)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? colors.primary.contrastText : colors.text.primary },
                  ]}
                >
                  {option === 'FRENTE' ? 'Frente' : 'Atrás'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.zoneGrid}>
        {zonas.map((zona) => {
          const isSelected = selectedZone === zona.key;

          return (
            <TouchableOpacity
              key={zona.key}
              style={[
                styles.zoneChip,
                {
                  borderColor: isSelected ? zona.color : colors.divider,
                  backgroundColor: isSelected ? zona.color : 'transparent',
                },
              ]}
              onPress={() => onSelectZone(zona.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.zoneDot, { backgroundColor: zona.color }]} />
              <Text
                style={[styles.zoneLabel, { color: isSelected ? colors.onAccent : colors.text.primary }]}
              >
                {zona.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: Shape.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  zoneLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
});
