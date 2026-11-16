import { ChevronRight, ChevronUp } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChartMini } from '@/components/BarChartMini';
import { Card } from '@/components/card';
import { BattleRow } from '@/components/dashboard/BattleRow';
import { DistributionBar } from '@/components/dashboard/DistributionBar';
import { StatPill } from '@/components/dashboard/StatPill';
import { TrendBadge } from '@/components/dashboard/TrendBadge';
import { ImcGauge } from '@/components/ImcGauge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { AVATARS } from '@/constants/avatars';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { useAuthStore } from '@/src/stores/authStore';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';
import {
  getGlucoseStatusColor,
  getRangeDominanceColor,
  type GlucoseRangeStatus,
} from '@/src/utils/glucoseRange';

function CardTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <ThemedText type="h6" style={[styles.cardTitle, { color }]}>
      {children}
    </ThemedText>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profileImg = usePreferenceConfig((state) => state.preference?.profileImg);

  const {
    ultimaLectura,
    lecturaAnterior,
    deltaLectura,
    porcentajeZonaSegura,
    totalLecturas,
    distribucion,
    rachaDias,
    deltaZonaSegura,
    peso,
    estatura,
    imcAnterior,
    imcFechaLabel,
    resumen,
    batallasRecientes,
    chartData,
    ultimoImc,
    imcCategoria,
    safety,
    refresh,
  } = useDashboardData();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const isWide = width >= 700;

  const glucoseColor = ultimaLectura
    ? getGlucoseStatusColor(ultimaLectura.rangeStatus, colors)
    : colors.text.disabled;

  const safeZoneColor =
    porcentajeZonaSegura === null
      ? colors.text.disabled
      : getRangeDominanceColor(porcentajeZonaSegura, colors);

  const imcColor =
    imcCategoria === 'Normal'
      ? colors.success.main
      : imcCategoria === 'Bajo peso'
        ? colors.error.main
        : imcCategoria === 'Sobrepeso'
          ? colors.warning.main
          : colors.text.disabled;

  const safetyColor =
    safety.status === 'safe'
      ? colors.accent.green
      : safety.status === 'soon'
        ? colors.warning.main
        : safety.status === 'waiting'
          ? colors.accent.blue
          : colors.text.disabled;

  const safetyLabel =
    safety.status === 'safe'
      ? t('screens:home.safe')
      : safety.status === 'soon'
        ? t('screens:home.expiresSoon')
        : safety.status === 'waiting'
          ? t('screens:home.shieldActive')
          : t('screens:home.noRecord');

  const safeZoneMessage =
    porcentajeZonaSegura === null
      ? t('screens:home.noReadings')
      : porcentajeZonaSegura >= 70
        ? t('screens:home.goodSafeZone')
        : t('screens:home.lowLevels');

  const translatedImcCategory = imcCategoria === 'Normal'
    ? t('screens:home.normal')
    : imcCategoria === 'Bajo peso'
      ? t('screens:home.underweight')
      : imcCategoria === 'Sobrepeso'
        ? t('screens:home.overweight')
        : null;

  const rangeStatusLabel = (status: GlucoseRangeStatus) =>
    status === 'low'
      ? t('screens:history.low')
      : status === 'high'
        ? t('screens:history.high')
        : t('screens:history.inRange');

  const deltaImc =
    ultimoImc !== null && imcAnterior !== null
      ? Math.round((ultimoImc - imcAnterior) * 10) / 10
      : null;

  const formatDelta = (delta: number | null, suffix?: string) => {
    if (delta === null) return '--';
    if (delta === 0) return t('screens:home.noChange');
    return `${delta > 0 ? '+' : ''}${delta}${suffix ? ` ${suffix}` : ''}`;
  };

  const safeZoneDeltaColor =
    deltaZonaSegura === null
      ? colors.text.disabled
      : deltaZonaSegura > 0
        ? colors.success.main
        : deltaZonaSegura < 0
          ? colors.error.main
          : colors.text.disabled;

  const bigValueStyle = [styles.bigValue, { fontSize: isWide ? 64 : 52, lineHeight: isWide ? 72 : 60 }];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isWide && styles.headerWide]}>
          <View style={styles.headerTop}>
            <ThemedText type="h4" style={[styles.greeting, isWide && styles.greetingWide]}>
              {user?.name
                ? t('screens:home.greeting', { name: user.name })
                : t('screens:home.greetingFallback')}
            </ThemedText>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.primary.main }]}
              onPress={() => router.push('/(tabs)/perfil')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('common:profile')}
            >
              <Image
                source={AVATARS[profileImg ?? ''] ?? AVATARS.GlucoAstro}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          <ThemedText muted style={styles.subtitle}>
            {t('screens:home.todaySummary')}
          </ThemedText>
        </View>

        <View style={styles.grid}>
          {/* Última Batalla */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <Card style={styles.card}>
              <CardTitle color={colors.accent.blue}>{t('screens:home.lastBattle')}</CardTitle>

              <View style={styles.glucoseRow}>
                <ThemedText style={[bigValueStyle, { color: glucoseColor }]}>
                  {ultimaLectura ? ultimaLectura.nivel : '--'}
                </ThemedText>
                <View style={styles.unitColumn}>
                  <ChevronUp
                    size={isWide ? 34 : 28}
                    color={glucoseColor}
                    strokeWidth={3}
                  />
                  <ThemedText style={[styles.unit, { color: glucoseColor }]}>
                    mg/dL
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.cardHint, { color: glucoseColor }]}>
                {ultimaLectura ? ultimaLectura.timeLabel : t('screens:home.noRecords')}
              </ThemedText>

              {ultimaLectura ? (
                <View style={[styles.statusChip, { borderColor: glucoseColor }]}>
                  <ThemedText type="caption" style={[styles.statusChipText, { color: glucoseColor }]}>
                    {rangeStatusLabel(ultimaLectura.rangeStatus)}
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.trendRow}>
                {deltaLectura !== null ? (
                  <TrendBadge
                    delta={deltaLectura}
                    suffix=" mg/dL"
                    flatLabel={t('screens:home.noChange')}
                  />
                ) : null}
                <ThemedText type="caption" muted numberOfLines={1}>
                  {lecturaAnterior !== null
                    ? t('screens:home.vsPreviousReading', { value: lecturaAnterior })
                    : t('screens:home.noPreviousReading')}
                </ThemedText>
              </View>

              {ultimaLectura?.contexto ? (
                <View style={[styles.contextChip, { backgroundColor: colors.background.default }]}>
                  <ThemedText type="caption" muted numberOfLines={1}>
                    {ultimaLectura.contexto}
                  </ThemedText>
                </View>
              ) : null}
            </Card>
          </View>

          {/* Dominio de la Zona Segura */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <Card style={styles.card}>
              <CardTitle color={colors.accent.blue}>{t('screens:home.safeZone')}</CardTitle>

              <ThemedText style={[bigValueStyle, styles.spacedValue, { color: safeZoneColor }]}>
                {porcentajeZonaSegura === null ? '--' : `${porcentajeZonaSegura}%`}
              </ThemedText>

              <ThemedText style={[styles.cardHint, { color: safeZoneColor }]}>
                {safeZoneMessage}
              </ThemedText>

              <View style={styles.blockStretch}>
                <ThemedText type="caption" muted style={styles.blockLabel}>
                  {t('screens:home.periodDistribution')}
                </ThemedText>
                <DistributionBar
                  distribution={distribucion}
                  labels={{
                    low: t('screens:history.low'),
                    inRange: t('screens:history.inRange'),
                    high: t('screens:history.high'),
                  }}
                />
              </View>

              <View style={styles.statRow}>
                <StatPill
                  label={t('screens:home.streakLabel')}
                  value={t('screens:home.streak', { count: rachaDias })}
                  color={rachaDias > 0 ? colors.success.main : colors.text.disabled}
                />
                <StatPill
                  label={t('screens:home.periodChange')}
                  value={formatDelta(deltaZonaSegura, 'pts')}
                  color={safeZoneDeltaColor}
                />
              </View>

              <ThemedText type="caption" muted style={styles.cardFootnote}>
                {totalLecturas > 0
                  ? t('screens:home.readingCount', { count: totalLecturas })
                  : t('screens:home.noReadingsRegistered')}
              </ThemedText>
            </Card>
          </View>

          {/* Balance de Fortaleza Física */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <Card style={styles.card}>
              <CardTitle color={colors.accent.blue}>{t('screens:home.physicalBalance')}</CardTitle>

              <ThemedText style={[bigValueStyle, styles.spacedValue, { color: colors.accent.gray }]}>
                {ultimoImc !== null ? ultimoImc.toFixed(1) : '--'}
              </ThemedText>

              <ThemedText style={[styles.cardHint, { color: imcColor }]}>
                {translatedImcCategory ?? t('screens:home.noRecords')}
              </ThemedText>

              <ImcGauge imc={ultimoImc} />

              <View style={styles.statRow}>
                <StatPill
                  label={t('screens:home.weightLabel')}
                  value={
                    peso !== null
                      ? t('screens:home.weightValue', { value: peso.toFixed(1) })
                      : '--'
                  }
                />
                <StatPill
                  label={t('screens:home.heightLabel')}
                  value={
                    estatura !== null
                      ? t('screens:home.heightValue', { value: estatura })
                      : '--'
                  }
                />
                <StatPill
                  label={t('screens:home.imcChangeLabel')}
                  value={formatDelta(deltaImc)}
                  color={colors.text.primary}
                />
              </View>

              <ThemedText type="caption" muted style={styles.cardFootnote}>
                {imcFechaLabel
                  ? t('screens:home.lastMeasurement', { time: imcFechaLabel.toLowerCase() })
                  : t('screens:home.noMeasurement')}
              </ThemedText>
            </Card>
          </View>

          {/* Cronómetro de Seguridad */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <Card style={styles.card}>
              <CardTitle color={colors.accent.blue}>{t('screens:home.safetyTimer')}</CardTitle>

              <ThemedText type="body2" muted style={styles.cardSubtitle}>
                {t('screens:home.lastRapidInsulin')}
              </ThemedText>

              <View style={styles.timerRow}>
                <ThemedText style={[bigValueStyle, { color: safetyColor }]}>
                  {safety.remainingLabel}
                </ThemedText>
                {safety.status !== 'none' ? (
                  <ThemedText style={[styles.timerUnit, { color: safetyColor }]}>
                    {t('screens:home.hoursRemaining')}
                  </ThemedText>
                ) : null}
              </View>

              <ThemedText style={[styles.cardHint, { color: safetyColor }]}>
                {safetyLabel}
              </ThemedText>

              {safety.lastDoseLabel ? (
                <ThemedText type="caption" muted style={styles.cardFootnote}>
                  {t('screens:home.lastDose', { time: safety.lastDoseLabel.toLowerCase() })}
                </ThemedText>
              ) : null}
            </Card>
          </View>

          {/* Historial de Batallas */}
          <View style={styles.gridItem}>
            <Card style={styles.chartCard}>
              <CardTitle color={colors.accent.blue}>{t('screens:home.battleHistory')}</CardTitle>

              <ThemedText type="caption" muted style={styles.chartSubtitle}>
                {t('screens:home.recentReadings')}
              </ThemedText>

              <BarChartMini
                data={chartData}
                height={isWide ? 200 : 180}
                emptyMessage={t('screens:home.chartEmpty')}
              />

              <View style={styles.statRow}>
                <StatPill
                  label={t('screens:home.average')}
                  value={resumen.average !== null ? `${resumen.average}` : '--'}
                  color={colors.accent.blue}
                />
                <StatPill
                  label={t('screens:home.minimum')}
                  value={resumen.min !== null ? `${resumen.min}` : '--'}
                  color={colors.error.main}
                />
                <StatPill
                  label={t('screens:home.maximum')}
                  value={resumen.max !== null ? `${resumen.max}` : '--'}
                  color={colors.warning.main}
                />
              </View>

              {batallasRecientes.length > 0 ? (
                <View style={styles.battleList}>
                  <ThemedText type="caption" muted style={styles.battleListTitle}>
                    {t('screens:home.recentBattles')}
                  </ThemedText>
                  {batallasRecientes.map((battle) => (
                    <BattleRow
                      key={battle.id}
                      battle={battle}
                      statusLabel={rangeStatusLabel(battle.rangeStatus)}
                    />
                  ))}
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.viewAllButton, { borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/historial')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('screens:home.viewAll')}
              >
                <ThemedText style={[styles.viewAllText, { color: colors.primary.main }]}>
                  {t('screens:home.viewAll')}
                </ThemedText>
                <ChevronRight size={16} color={colors.primary.main} />
              </TouchableOpacity>
            </Card>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerWide: {
    alignItems: 'flex-start',
  },
  greeting: {
    flex: 1,
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    textAlign: 'center',
  },
  greetingWide: {
    fontSize: 32,
    textAlign: 'left',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: '100%',
  },
  gridItemHalf: {
    flexBasis: '45%',
    minWidth: 260,
  },
  card: {
    height: '100%',
    minHeight: 210,
    marginVertical: 0,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    marginVertical: 0,
    padding: 24,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 8,
  },
  cardSubtitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  glucoseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bigValue: {
    fontFamily: Fonts.extraBold,
  },
  spacedValue: {
    marginTop: 8,
  },
  unitColumn: {
    alignItems: 'center',
    marginLeft: 6,
    marginTop: 8,
  },
  unit: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  cardHint: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
  cardFootnote: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 8,
  },
  timerUnit: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  chartSubtitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  blockStretch: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
  blockLabel: {
    textAlign: 'center',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusChip: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.semiBold,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  contextChip: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 12,
  },
  battleList: {
    alignSelf: 'stretch',
    marginTop: 14,
  },
  battleListTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'stretch',
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
});
