import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { leccionesPorNivel } from '@/src/data/caminoLessons';

const WORLDS = [
  { number: 1, title: 'energy' },
  { number: 2, title: 'safety' },
  { number: 3, title: 'carbohydrates' },
  { number: 4, title: 'insulin' },
  { number: 5, title: 'explorer' },
] as const;

const BADGES = [
  require('../../assets/insigniasCamino/escudo_de_fribra.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
];

interface PathMapProps {
  lastCompletedLevel: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectLevel: (level: number) => void;
}

export function PathMap({
  lastCompletedLevel,
  loading,
  error,
  onRetry,
  onSelectLevel,
}: PathMapProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('screens');
  const progressPercent = Math.round((lastCompletedLevel / 15) * 100);
  const unlockedBadges = Math.floor(lastCompletedLevel / 3);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <ThemedText muted style={styles.stateText}>{t('warriorPath.loading')}</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <FontAwesome name="exclamation-circle" size={40} color={colors.error.main} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
          onPress={onRetry}
          accessibilityRole="button"
        >
          <ThemedText style={styles.retryText}>{t('warriorPath.retry')}</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/tabbar/colina.png')}
          style={styles.pathIcon}
          resizeMode="contain"
        />
        <ThemedText type="h4" style={styles.title}>
          {t('warriorPath.title')}
        </ThemedText>
        <ThemedText muted style={styles.subtitle}>
          {t('warriorPath.subtitle')}
        </ThemedText>
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <ThemedText type="defaultSemiBold">{t('warriorPath.progress')}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: colors.primary.dark }}>
            {progressPercent}%
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: colors.success.main },
            ]}
          />
        </View>
        <ThemedText muted style={styles.progressCaption}>
          {t('warriorPath.completed', { percent: progressPercent, levels: lastCompletedLevel })}
        </ThemedText>
      </Card>

      <View style={styles.mapSection}>
        {WORLDS.map((world) => {
          const firstLevel = (world.number - 1) * 3 + 1;
          const worldUnlocked = firstLevel <= lastCompletedLevel + 1;
          return (
            <View key={world.number} style={styles.world}>
              <View
                style={[
                  styles.worldHeader,
                  {
                    backgroundColor: worldUnlocked ? colors.primary.dark : colors.divider,
                    borderColor: worldUnlocked ? colors.primary.dark : colors.border,
                  },
                ]}
              >
                <View style={[styles.headerLine, { backgroundColor: colors.text.disabled }]} />
                <View style={styles.worldTitleWrap}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: worldUnlocked ? colors.text.inverse : colors.text.disabled }}
                  >
                    {t('warriorPath.world', { number: world.number })}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.worldSubtitle,
                      { color: worldUnlocked ? colors.text.inverse : colors.text.disabled },
                    ]}
                  >
                    {t(`warriorPath.worlds.${world.title}`)}
                  </ThemedText>
                </View>
                <View style={[styles.headerLine, { backgroundColor: colors.text.disabled }]} />
              </View>

              {Array.from({ length: 3 }, (_, index) => {
                const level = firstLevel + index;
                const completed = level <= lastCompletedLevel;
                const available = level <= lastCompletedLevel + 1;
                const color = completed
                  ? colors.success.main
                  : available
                    ? colors.primary.main
                    : colors.text.disabled;

                return (
                  <View key={level} style={styles.levelRow}>
                    <TouchableOpacity
                      onPress={() => onSelectLevel(level)}
                      disabled={!available}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !available }}
                      accessibilityLabel={`${t('warriorPath.level', { number: level })}: ${t(completed ? 'warriorPath.completedLevel' : available ? 'warriorPath.available' : 'warriorPath.locked')}`}
                      style={[
                        styles.levelButton,
                        index % 2 === 0 ? styles.levelLeft : styles.levelRight,
                        !available && styles.lockedLevel,
                      ]}
                    >
                      <Svg width={76} height={72} viewBox="0 0 76 72">
                        <Polygon
                          points="38,2 72,19 72,53 38,70 4,53 4,19"
                          fill={color}
                          stroke={completed ? colors.success.dark : available ? colors.primary.dark : colors.border}
                          strokeWidth={3}
                        />
                      </Svg>
                      <ThemedText
                        type="h6"
                        style={[
                          styles.levelNumber,
                          { color: available ? colors.text.inverse : colors.text.disabled },
                        ]}
                      >
                        {level}
                      </ThemedText>
                      {completed && (
                        <View style={[styles.completedMark, { backgroundColor: colors.success.dark }]}>
                          <FontAwesome name="check" size={11} color={colors.success.contrastText} />
                        </View>
                      )}
                      {!available && (
                        <View style={styles.lockMark}>
                          <FontAwesome name="lock" size={12} color={colors.text.disabled} />
                        </View>
                      )}
                      <ThemedText
                        numberOfLines={2}
                        style={[
                          styles.levelTitle,
                          { color: available ? colors.text.primary : colors.text.disabled },
                        ]}
                      >
                        {t(`warriorPath.lessonTitles.${level}`, {
                          defaultValue: leccionesPorNivel[level]?.titulo ?? t('warriorPath.level', { number: level }),
                        })}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <ThemedText type="defaultSemiBold" style={styles.collectionTitle}>
        {t('warriorPath.collection')}
      </ThemedText>
      <View style={styles.badges}>
        {BADGES.map((image, index) => {
          const unlocked = index < unlockedBadges;
          return (
            <Card key={index} style={[styles.badgeCard, !unlocked && styles.lockedBadge]}>
              <Image
                source={image}
                style={[styles.badgeImage, !unlocked && styles.badgeImageLocked]}
                resizeMode="contain"
              />
              {!unlocked && (
                <View style={[styles.badgeLock, { backgroundColor: colors.background.paper }]}>
                  <FontAwesome name="lock" size={13} color={colors.text.disabled} />
                </View>
              )}
              <ThemedText
                type="defaultSemiBold"
                style={[styles.badgeName, !unlocked && { color: colors.text.disabled }]}
              >
                {t(`warriorPath.badges.${index}`)}
              </ThemedText>
              <ThemedText muted style={styles.badgeWorld}>
                {t('warriorPath.world', { number: index + 1 })}
              </ThemedText>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  stateText: { marginTop: 12, textAlign: 'center' },
  errorText: { textAlign: 'center', maxWidth: 320 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 20 },
  pathIcon: { width: 48, height: 48 },
  title: { marginTop: 8, textAlign: 'center' },
  subtitle: { marginTop: 4, textAlign: 'center' },
  progressCard: { padding: 18, marginBottom: 24 },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTrack: { height: 12, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  progressCaption: { marginTop: 8, fontSize: 13 },
  mapSection: { marginBottom: 28 },
  world: { marginBottom: 20 },
  worldHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerLine: { flex: 1, height: 1 },
  worldTitleWrap: { alignItems: 'center' },
  worldSubtitle: { fontSize: 12, textAlign: 'center' },
  levelRow: { minHeight: 116, justifyContent: 'center' },
  levelButton: { width: 104, minHeight: 108, alignItems: 'center', justifyContent: 'center' },
  levelLeft: { alignSelf: 'flex-start', marginLeft: 36 },
  levelRight: { alignSelf: 'flex-end', marginRight: 36 },
  lockedLevel: { opacity: 0.75 },
  levelNumber: { position: 'absolute', top: 20 },
  completedMark: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockMark: { position: 'absolute', right: 12, top: 12 },
  levelTitle: {
    position: 'absolute',
    bottom: 0,
    width: 104,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  collectionTitle: { fontSize: 18, marginBottom: 14 },
  badges: { gap: 12 },
  badgeCard: { minHeight: 108, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lockedBadge: { opacity: 0.75 },
  badgeImage: { width: 64, height: 64 },
  badgeImageLocked: { opacity: 0.35 },
  badgeLock: {
    position: 'absolute',
    left: 56,
    top: 54,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: { flex: 1, fontSize: 14 },
  badgeWorld: { fontSize: 12 },
});
