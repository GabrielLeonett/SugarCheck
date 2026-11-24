import { ChevronRight } from 'lucide-react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChartMini } from '@/components/BarChartMini';
import { Card } from '@/components/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DistributionBar } from '@/components/dashboard/DistributionBar';
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
} from '@/src/utils/glucoseRange';

function DashboardCard({
  title,
  href,
  accessibilityLabel,
  children,
  style,
}: {
  title: string;
  href: Href;
  accessibilityLabel: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.cardButton}
      onPress={() => router.push(href)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Card style={style}>
        <View style={styles.cardHeader}>
          <ThemedText type="h6" style={[styles.cardTitle, { color: colors.accent.blue }]}>
            {title}
          </ThemedText>
          <ChevronRight size={18} color={colors.text.disabled} />
        </View>
        {children}
      </Card>
    </TouchableOpacity>
  );
}

function HomeScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profileImg = usePreferenceConfig((state) => state.preference?.profileImg);

  const {
    ultimaLectura,
    porcentajeZonaSegura,
    distribucion,
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
            <DashboardCard
              title={t('screens:home.lastBattle')}
              href="/bitacora/glucosa"
              accessibilityLabel={t('screens:home.lastBattle')}
              style={styles.card}
            >
              <View style={styles.glucoseRow}>
                <ThemedText style={[bigValueStyle, { color: glucoseColor }]}>
                  {ultimaLectura ? ultimaLectura.nivel : '--'}
                </ThemedText>
                <ThemedText style={[styles.unit, { color: glucoseColor }]}>
                  mg/dL
                </ThemedText>
              </View>
              <ThemedText style={[styles.cardHint, { color: glucoseColor }]}>
                {ultimaLectura ? ultimaLectura.timeLabel : t('screens:home.noRecords')}
              </ThemedText>
            </DashboardCard>
          </View>

          {/* Dominio de la Zona Segura */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <DashboardCard
              title={t('screens:home.safeZone')}
              href="/(tabs)/historial"
              accessibilityLabel={t('screens:home.safeZone')}
              style={styles.card}
            >
              <ThemedText style={[bigValueStyle, styles.spacedValue, { color: safeZoneColor }]}>
                {porcentajeZonaSegura === null ? '--' : `${porcentajeZonaSegura}%`}
              </ThemedText>
              <ThemedText style={[styles.cardHint, { color: safeZoneColor }]}>
                {safeZoneMessage}
              </ThemedText>
              <View style={styles.blockStretch}>
                <DistributionBar
                  distribution={distribucion}
                  labels={{
                    low: t('screens:history.low'),
                    inRange: t('screens:history.inRange'),
                    high: t('screens:history.high'),
                  }}
                />
              </View>
            </DashboardCard>
          </View>

          {/* Balance de Fortaleza Física */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <DashboardCard
              title={t('screens:home.physicalBalance')}
              href="/bitacora/monitoreo-fisico"
              accessibilityLabel={t('screens:home.physicalBalance')}
              style={styles.card}
            >
              <ThemedText style={[bigValueStyle, styles.spacedValue, { color: colors.accent.gray }]}>
                {ultimoImc !== null ? ultimoImc.toFixed(1) : '--'}
              </ThemedText>
              <ThemedText style={[styles.cardHint, { color: imcColor }]}>
                {translatedImcCategory ?? t('screens:home.noRecords')}
              </ThemedText>
              <ImcGauge imc={ultimoImc} />
            </DashboardCard>
          </View>

          {/* Cronómetro de Seguridad */}
          <View style={[styles.gridItem, isWide && styles.gridItemHalf]}>
            <DashboardCard
              title={t('screens:home.safetyTimer')}
              href="/bitacora/insulina"
              accessibilityLabel={t('screens:home.safetyTimer')}
              style={styles.card}
            >
              <View style={styles.glucoseRow}>
                <ThemedText style={[bigValueStyle, { color: safetyColor }]}>
                  {safety.remainingLabel}
                </ThemedText>
                <ThemedText style={[styles.unit, { color: safetyColor }]}>
                  {t('screens:home.hoursShort')}
                </ThemedText>
              </View>
              <ThemedText style={[styles.cardHint, { color: safetyColor }]}>
                {safetyLabel}
              </ThemedText>
            </DashboardCard>
          </View>

          {/* Historial de Batallas */}
          <View style={styles.gridItem}>
            <DashboardCard
              title={t('screens:home.battleHistory')}
              href="/(tabs)/historial"
              accessibilityLabel={t('screens:home.battleHistory')}
              style={styles.chartCard}
            >
              <BarChartMini
                data={chartData}
                height={isWide ? 200 : 180}
                emptyMessage={t('screens:home.chartEmpty')}
              />
            </DashboardCard>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

export default function HomeScreenWithBoundary() {
  return (
    <ErrorBoundary fallbackTitle="Falló el dashboard de inicio">
      <HomeScreen />
    </ErrorBoundary>
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
  cardButton: {
    alignSelf: 'stretch',
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    flex: 1,
  },
  glucoseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 8,
  },
  bigValue: {
    fontFamily: Fonts.extraBold,
  },
  spacedValue: {
    marginTop: 8,
  },
  unit: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    marginLeft: 6,
  },
  cardHint: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
  blockStretch: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
