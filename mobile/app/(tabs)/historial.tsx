import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { insulinaApi } from '@/src/apis/insulina';
import type { InsulinRecord } from '@/src/types';

const TABS = [
  { key: 'glucosa', label: 'Glucosa', icon: 'heartbeat' },
  { key: 'insulina', label: 'Insulina', icon: 'clock-o' },
  { key: 'hba1c', label: 'HbA1c', icon: 'tint' },
  { key: 'fisico', label: 'Físico', icon: 'balance-scale' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const MOCK_GLUCOSE = [
  { id: '1', nivel: 120, contexto: 'Antes del desayuno', fecha: '21/07/2026', hora: '08:00' },
  { id: '2', nivel: 145, contexto: 'Después del almuerzo', fecha: '20/07/2026', hora: '14:30' },
  { id: '3', nivel: 98, contexto: 'Antes de dormir', fecha: '19/07/2026', hora: '22:00' },
  { id: '4', nivel: 156, contexto: 'Después del desayuno', fecha: '18/07/2026', hora: '09:15' },
  { id: '5', nivel: 132, contexto: 'Antes del almuerzo', fecha: '17/07/2026', hora: '12:00' },
];

const MOCK_HBA1C = [
  { id: '1', resultado: 6.5, fecha: '21/07/2026', estimado: '7.8 mmol/mol' },
  { id: '2', resultado: 7.0, fecha: '01/06/2026', estimado: '8.6 mmol/mol' },
  { id: '3', resultado: 6.8, fecha: '01/05/2026', estimado: '8.2 mmol/mol' },
];

const MOCK_FISICO = [
  { id: '1', fecha: '20/07/2026', peso: 54.2, estatura: 158, imc: 21.7, estado: 'Normal' },
  { id: '2', fecha: '12/06/2026', peso: 63.5, estatura: 158, imc: 25.4, estado: 'Sobrepeso' },
  { id: '3', fecha: '02/05/2026', peso: 65.0, estatura: 157, imc: 26.4, estado: 'Sobrepeso' },
];

function formatHora(hora: string) {
  const [h, m] = hora.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function withAlpha(hex: string, opacity: number) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}

function getGlucoseColor(nivel: number, colors: ThemeColors) {
  if (nivel < 70) return colors.error.main;
  if (nivel <= 140) return colors.success.main;
  if (nivel <= 180) return colors.warning.main;
  return colors.error.main;
}

export default function HistorialScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('insulina');
  const [insulinRecords, setInsulinRecords] = useState<InsulinRecord[]>([]);
  const [loadingInsulin, setLoadingInsulin] = useState(false);
  const [insulinFilter, setInsulinFilter] = useState<'todas' | 'RAPIDA' | 'LENTA'>('todas');

  const loadInsulin = useCallback(async () => {
    setLoadingInsulin(true);
    try {
      const data = await insulinaApi.getAll();
      setInsulinRecords(data ?? []);
    } catch {
      setInsulinRecords([]);
    } finally {
      setLoadingInsulin(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'insulina') loadInsulin();
  }, [activeTab, loadInsulin]);

  const filteredInsulin = insulinRecords
    .filter((r) => insulinFilter === 'todas' || r.tipo === insulinFilter)
    .reverse();

  const renderTab = (tab: (typeof TABS)[number]) => {
    const isActive = activeTab === tab.key;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          { backgroundColor: isActive ? colors.primary.main : 'transparent' },
        ]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.8}
      >
        <FontAwesome
          name={tab.icon as any}
          size={16}
          color={isActive ? colors.primary.contrastText : colors.text.primary}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            { color: isActive ? colors.primary.contrastText : colors.text.primary },
          ]}
        >
          {tab.label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'glucosa':
        return (
          <View>
            {MOCK_GLUCOSE.map((g) => (
              <Card key={g.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ fontSize: 24, color: getGlucoseColor(g.nivel, colors) }}
                  >
                    {g.nivel}
                  </ThemedText>
                  <ThemedText muted style={{ fontSize: 12 }}>
                    mg/dL
                  </ThemedText>
                </View>
                <ThemedText muted style={{ fontSize: 13 }}>
                  {g.contexto}
                </ThemedText>
                <ThemedText muted style={{ fontSize: 12 }}>
                  {g.fecha} · {formatHora(g.hora)}
                </ThemedText>
              </Card>
            ))}
          </View>
        );

      case 'insulina':
        return (
          <View>
            <View style={styles.filterRow}>
              {(['todas', 'RAPIDA', 'LENTA'] as const).map((filter) => {
                const isActive = insulinFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive ? colors.primary.main : 'transparent',
                        borderColor: colors.primary.main,
                      },
                    ]}
                    onPress={() => setInsulinFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: isActive ? colors.primary.contrastText : colors.primary.main,
                      }}
                    >
                      {filter === 'todas' ? 'Todas' : filter === 'RAPIDA' ? 'Rápida' : 'Lenta'}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadingInsulin ? (
              <ThemedText muted style={styles.centerMessage}>
                Cargando...
              </ThemedText>
            ) : filteredInsulin.length === 0 ? (
              <ThemedText muted style={styles.centerMessage}>
                Sin registros de insulina
              </ThemedText>
            ) : (
              filteredInsulin.map((record) => {
                const isRapida = record.tipo === 'RAPIDA';
                const badgeColor = isRapida ? colors.info.main : colors.warning.main;

                return (
                  <Card key={record.id} style={styles.recordCard}>
                    <View style={styles.recordRow}>
                      <View style={styles.recordContent}>
                        <View style={styles.recordHeader}>
                          <ThemedText type="defaultSemiBold" style={{ fontSize: 20 }}>
                            {record.dosis} UI
                          </ThemedText>
                          <View
                            style={[styles.tipoBadge, { backgroundColor: withAlpha(badgeColor, 0.15) }]}
                          >
                            <ThemedText style={{ fontSize: 11, color: badgeColor }}>
                              {isRapida ? 'Rápida' : 'Lenta'}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText muted style={{ fontSize: 12, marginTop: 4 }}>
                          {record.fecha} · {formatHora(record.hora)}
                        </ThemedText>
                        <View style={styles.recordMeta}>
                          {record.zonaLabel && (
                            <ThemedText muted style={{ fontSize: 11 }}>
                              {record.zonaLabel}
                            </ThemedText>
                          )}
                          {record.contextoLabel && (
                            <ThemedText muted style={{ fontSize: 11 }}>
                              {' '}· {record.contextoLabel}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        );

      case 'hba1c':
        return (
          <View>
            {MOCK_HBA1C.map((record) => (
              <Card key={record.id} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={styles.recordContent}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 22 }}>
                      {record.resultado}%
                    </ThemedText>
                    <ThemedText muted style={{ fontSize: 12 }}>
                      {record.estimado}
                    </ThemedText>
                  </View>
                  <ThemedText muted style={{ fontSize: 12 }}>
                    {record.fecha}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        );

      case 'fisico':
        return (
          <View>
            {MOCK_FISICO.map((record) => {
              const isNormal = record.estado === 'Normal';
              const statusColor = isNormal ? colors.success.main : colors.warning.main;

              return (
                <Card key={record.id} style={styles.recordCard}>
                  <View style={styles.recordRow}>
                    <View style={styles.recordContent}>
                      <View style={styles.recordRow}>
                        <ThemedText type="defaultSemiBold">{record.peso} kg</ThemedText>
                        <ThemedText muted style={styles.separator}>
                          |
                        </ThemedText>
                        <ThemedText type="defaultSemiBold">{record.estatura} cm</ThemedText>
                        <ThemedText muted style={styles.separator}>
                          |
                        </ThemedText>
                        <ThemedText type="defaultSemiBold">IMC {record.imc}</ThemedText>
                      </View>
                      <View
                        style={[
                          styles.estadoBadge,
                          { backgroundColor: withAlpha(statusColor, 0.15) },
                        ]}
                      >
                        <ThemedText style={{ fontSize: 11, color: statusColor }}>
                          {record.estado}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText muted style={{ fontSize: 12 }}>
                      {record.fecha}
                    </ThemedText>
                  </View>
                </Card>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.headerTitle, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>
          Historial
        </ThemedText>
      </View>

      <View style={styles.tabRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map(renderTab)}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        key={activeTab}
      >
        {renderTabContent()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { paddingHorizontal: 16, paddingBottom: 8 },
  tabRow: { paddingHorizontal: 16, marginBottom: 16 },
  tabsContainer: { flexDirection: 'row', gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  tabLabel: { fontSize: 13, fontFamily: Fonts.medium },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'flex-start' },
  recordContent: { flex: 1 },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  centerMessage: { textAlign: 'center', marginTop: 24 },
  separator: { marginHorizontal: 8 },
});
