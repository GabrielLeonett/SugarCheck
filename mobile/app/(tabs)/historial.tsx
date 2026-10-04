import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { insulinaApi } from '@/src/apis/insulina';
import type { InsulinRecord } from '@/src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

function getGlucoseColor(nivel: number) {
  if (nivel < 70) return '#d32f2f';
  if (nivel <= 140) return '#2e7d32';
  if (nivel <= 180) return '#f57c00';
  return '#d32f2f';
}

export default function HistorialScreen() {
  const colorScheme = useColorScheme() ?? 'light';
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
          { backgroundColor: isActive ? Colors[colorScheme].tint : 'transparent' },
        ]}
        onPress={() => setActiveTab(tab.key)}
      >
        <FontAwesome
          name={tab.icon as any}
          size={16}
          color={isActive ? '#fff' : Colors[colorScheme].text}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            { color: isActive ? '#fff' : Colors[colorScheme].text },
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
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 24, color: getGlucoseColor(g.nivel) }}>
                    {g.nivel}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>mg/dL</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>{g.contexto}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{g.fecha} · {formatHora(g.hora)}</ThemedText>
              </Card>
            ))}
          </View>
        );

      case 'insulina':
        return (
          <View>
            <View style={styles.filterRow}>
              {(['todas', 'RAPIDA', 'LENTA'] as const).map((f) => {
                const isActive = insulinFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterChip,
                      { backgroundColor: isActive ? Colors[colorScheme].tint : 'transparent', borderColor: Colors[colorScheme].tint },
                    ]}
                    onPress={() => setInsulinFilter(f)}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: isActive ? '#fff' : Colors[colorScheme].tint,
                      }}
                    >
                      {f === 'todas' ? 'Todas' : f === 'RAPIDA' ? 'Rápida' : 'Lenta'}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadingInsulin ? (
              <ThemedText style={{ textAlign: 'center', marginTop: 24, opacity: 0.5 }}>Cargando...</ThemedText>
            ) : filteredInsulin.length === 0 ? (
              <ThemedText style={{ textAlign: 'center', marginTop: 24, opacity: 0.5 }}>Sin registros de insulina</ThemedText>
            ) : (
              filteredInsulin.map((r) => (
                <Card key={r.id} style={styles.recordCard}>
                  <View style={styles.recordRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.recordHeader}>
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 20 }}>
                          {r.dosis} UI
                        </ThemedText>
                        <View style={[styles.tipoBadge, { backgroundColor: r.tipo === 'RAPIDA' ? '#4FC3F720' : '#FFA72620' }]}>
                          <ThemedText style={{ fontSize: 11, color: r.tipo === 'RAPIDA' ? '#4FC3F7' : '#FFA726' }}>
                            {r.tipo === 'RAPIDA' ? 'Rápida' : 'Lenta'}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                        {r.fecha} · {formatHora(r.hora)}
                      </ThemedText>
                      <View style={styles.recordMeta}>
                        {r.zonaLabel && (
                          <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>{r.zonaLabel}</ThemedText>
                        )}
                        {r.contextoLabel && (
                          <ThemedText style={{ fontSize: 11, opacity: 0.5 }}> · {r.contextoLabel}</ThemedText>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        );

      case 'hba1c':
        return (
          <View>
            {MOCK_HBA1C.map((h) => (
              <Card key={h.id} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 22 }}>
                      {h.resultado}%
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{h.estimado}</ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{h.fecha}</ThemedText>
                </View>
              </Card>
            ))}
          </View>
        );

      case 'fisico':
        return (
          <View>
            {MOCK_FISICO.map((f) => (
              <Card key={f.id} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.recordRow}>
                      <ThemedText type="defaultSemiBold">{f.peso} kg</ThemedText>
                      <ThemedText style={{ marginHorizontal: 8, opacity: 0.3 }}>|</ThemedText>
                      <ThemedText type="defaultSemiBold">{f.estatura} cm</ThemedText>
                      <ThemedText style={{ marginHorizontal: 8, opacity: 0.3 }}>|</ThemedText>
                      <ThemedText type="defaultSemiBold">IMC {f.imc}</ThemedText>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: f.estado === 'Normal' ? '#2e7d3220' : '#f57c0020', alignSelf: 'flex-start', marginTop: 8 }]}>
                      <ThemedText style={{ fontSize: 11, color: f.estado === 'Normal' ? '#2e7d32' : '#f57c00' }}>
                        {f.estado}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{f.fecha}</ThemedText>
                </View>
              </Card>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerTitle}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Historial</ThemedText>
      </View>

      <View style={styles.tabRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
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
  headerTitle: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
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
  tabLabel: { fontSize: 13 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'flex-start' },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5 },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
