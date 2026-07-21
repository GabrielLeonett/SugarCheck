import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ZONAS_INYECCION } from '@/src/types';

interface ZoneSelectorProps {
  selectedZone: string;
  onSelectZone: (zoneKey: string) => void;
}

export function ZoneSelector({ selectedZone, onSelectZone }: ZoneSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [vista, setVista] = useState<'FRENTE' | 'ATRAS'>('FRENTE');
  const zonas = ZONAS_INYECCION[vista];

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[styles.header, { marginBottom: 10 }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Zona de inyección</Text>
        <View style={[styles.toggleRow, { borderColor: colors.divider }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, vista === 'FRENTE' && { backgroundColor: colors.tint }]}
            onPress={() => setVista('FRENTE')}
          >
            <Text style={[styles.toggleText, { color: vista === 'FRENTE' ? '#fff' : colors.text.primary }]}>
              Frente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, vista === 'ATRAS' && { backgroundColor: colors.tint }]}
            onPress={() => setVista('ATRAS')}
          >
            <Text style={[styles.toggleText, { color: vista === 'ATRAS' ? '#fff' : colors.text.primary }]}>
              Atrás
            </Text>
          </TouchableOpacity>
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
            >
              <View style={[styles.zoneDot, { backgroundColor: zona.color }]} />
              <Text
                style={[
                  styles.zoneLabel,
                  { color: isSelected ? '#fff' : colors.text.primary },
                ]}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
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
    fontFamily: 'Montserrat-SemiBold',
  },
});
