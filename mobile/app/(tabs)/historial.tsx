import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { glucoseApi, type GlucoseEntry } from '@/src/apis/glucose';
import { hba1cApi } from '@/src/apis/hba1c';
import { imcApi } from '@/src/apis/imc';
import { insulinaApi } from '@/src/apis/insulina';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';
import type { HbA1cRecord, InsulinRecord, PhysicalRecord } from '@/src/types';
import { getGlucoseStatusColor, getGlucoseRangeStatus } from '@/src/utils/glucoseRange';

const TABS = [
  { key: 'glucosa', label: 'Glucosa', icon: 'heartbeat' },
  { key: 'insulina', label: 'Insulina', icon: 'clock-o' },
  { key: 'hba1c', label: 'HbA1c', icon: 'tint' },
  { key: 'fisico', label: 'Físico', icon: 'balance-scale' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

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

export default function HistorialScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const preference = usePreferenceConfig((state) => state.preference);
  const loadPreference = usePreferenceConfig((state) => state.load);
  const [activeTab, setActiveTab] = useState<TabKey>('insulina');
  const [glucoseRecords, setGlucoseRecords] = useState<GlucoseEntry[]>([]);
  const [insulinRecords, setInsulinRecords] = useState<InsulinRecord[]>([]);
  const [hba1cRecords, setHba1cRecords] = useState<HbA1cRecord[]>([]);
  const [physicalRecords, setPhysicalRecords] = useState<PhysicalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [insulinFilter, setInsulinFilter] = useState<'todas' | 'RAPIDA' | 'LENTA'>('todas');
  const thresholds = preference?.thresholds ?? { hypo: 70, hiper: 180 };

  useFocusEffect(
    useCallback(() => {
      if (!preference) {
        loadPreference().catch(() => {
          showErrorAlert('No se pudieron cargar los límites de glucosa; se usarán los valores predeterminados');
        });
      }
    }, [loadPreference, preference])
  );

  const loadRecords = useCallback(async (tab: TabKey) => {
    setLoadingRecords(true);
    try {
      switch (tab) {
        case 'glucosa':
          setGlucoseRecords(await glucoseApi.getAll());
          break;
        case 'insulina':
          setInsulinRecords(await insulinaApi.getAll());
          break;
        case 'hba1c':
          setHba1cRecords(await hba1cApi.getAll());
          break;
        case 'fisico':
          setPhysicalRecords(await imcApi.getAll());
          break;
      }
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || `No se pudo cargar el historial de ${tab}`);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecords(activeTab);
    }, [activeTab, loadRecords])
  );

  const filteredInsulin = insulinRecords
    .filter((r) => insulinFilter === 'todas' || r.tipo === insulinFilter)
    .reverse();

  const renderTab = (tab: (typeof TABS)[number]) => {
    const isActive = activeTab === tab.key;
    const tabLabels: Record<TabKey, string> = {
      glucosa: t('screens:history.glucose'),
      insulina: t('screens:history.insulin'),
      hba1c: t('screens:history.hba1c'),
      fisico: t('screens:history.physical'),
    };

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
          {tabLabels[tab.key]}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'glucosa':
        return (
          <View>
            {glucoseRecords.length === 0 ? (
              <ThemedText muted style={styles.centerMessage}>
                {loadingRecords ? t('screens:history.loading') : t('screens:history.noGlucose')}
              </ThemedText>
            ) : glucoseRecords.map((g) => {
              const status = getGlucoseRangeStatus(g.nivel, thresholds);
              const statusLabel =
                status === 'low'
                  ? t('screens:history.low')
                  : status === 'high'
                    ? t('screens:history.high')
                    : t('screens:history.inRange');
              const statusColor = getGlucoseStatusColor(status, colors);

              return (
                <Card key={g.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ fontSize: 24, color: statusColor }}
                    >
                      {g.nivel}
                    </ThemedText>
                    <ThemedText muted style={{ fontSize: 12 }}>
                      mg/dL
                    </ThemedText>
                    <ThemedText style={{ color: statusColor, fontSize: 12, marginLeft: 'auto' }}>
                      {statusLabel}
                    </ThemedText>
                  </View>
                  <ThemedText muted style={{ fontSize: 13 }}>
                    {g.contexto}
                  </ThemedText>
                  <ThemedText muted style={{ fontSize: 12 }}>
                    {g.fecha} · {g.hora}
                  </ThemedText>
                </Card>
              );
            })}
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
                      {filter === 'todas'
                        ? t('screens:history.all')
                        : filter === 'RAPIDA'
                          ? t('screens:history.rapid')
                          : t('screens:history.slow')}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadingRecords ? (
              <ThemedText muted style={styles.centerMessage}>
                {t('screens:history.loading')}
              </ThemedText>
            ) : filteredInsulin.length === 0 ? (
              <ThemedText muted style={styles.centerMessage}>
                {t('screens:history.noInsulin')}
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
                              {isRapida ? t('screens:history.rapid') : t('screens:history.slow')}
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
            {hba1cRecords.length === 0 ? (
              <ThemedText muted style={styles.centerMessage}>
                {loadingRecords ? t('screens:history.loading') : t('screens:history.noHba1c')}
              </ThemedText>
            ) : hba1cRecords.map((record) => (
              <Card key={record.id} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={styles.recordContent}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 22 }}>
                      {record.resultado}%
                    </ThemedText>
                    <ThemedText muted style={{ fontSize: 12 }}>
                      eAG: {Math.round(record.resultado * 28.7 - 46.7)} mg/dL
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
            {physicalRecords.length === 0 ? (
              <ThemedText muted style={styles.centerMessage}>
                {loadingRecords ? t('screens:history.loading') : t('screens:history.noPhysical')}
              </ThemedText>
            ) : physicalRecords.map((record) => {
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
                          {record.estado === 'Normal' ? t('screens:home.normal') : record.estado}
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
          {t('screens:history.title')}
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
