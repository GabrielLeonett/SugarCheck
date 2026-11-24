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
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { leccionesPorNivel } from '@/src/data/caminoLessons';

import { CaminoMap } from './CaminoMap';
import { MUNDOS } from './caminoTheme';

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
  const currentLevel = Math.min(lastCompletedLevel + 1, 15);
  const currentWorld =
    MUNDOS.find(
      (mundo) => currentLevel >= mundo.levelRange[0] && currentLevel <= mundo.levelRange[1]
    ) ?? MUNDOS[0];

  const currentTitle = t(`warriorPath.lessonTitles.${currentLevel}`, {
    defaultValue:
      leccionesPorNivel[currentLevel]?.titulo ?? t('warriorPath.level', { number: currentLevel }),
  });

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

      {/* Misión actual con Gluco */}
      <Card
        style={[
          styles.missionCard,
          {
            borderColor: `${currentWorld.accent}66`,
            backgroundColor: `${currentWorld.accent}14`,
          },
        ]}
      >
        <Image
          source={require('../../assets/gluco-saludo.png')}
          style={styles.missionGluco}
          resizeMode="contain"
        />
        <View style={styles.missionInfo}>
          <ThemedText style={[styles.missionLabel, { color: currentWorld.accent }]}>
            {t('warriorPath.currentMission')}
          </ThemedText>
          <ThemedText
            numberOfLines={1}
            style={[styles.missionWorld, { color: currentWorld.accent }]}
          >
            {t('warriorPath.world', { number: currentWorld.numero })} ·{' '}
            {t(`warriorPath.worlds.${currentWorld.key}`)}
          </ThemedText>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.missionTitle}>
            {currentTitle}
          </ThemedText>
          <ThemedText muted style={styles.missionHint}>
            {t('warriorPath.keepGoing')}
          </ThemedText>
        </View>
      </Card>

      <CaminoMap lastCompletedLevel={lastCompletedLevel} onSelectLevel={onSelectLevel} />

      <ThemedText type="defaultSemiBold" style={styles.collectionTitle}>
        {t('warriorPath.collection')}
      </ThemedText>
      <View style={styles.badges}>
        {BADGES.map((image, index) => {
          const unlocked = index < unlockedBadges;
          const mundo = MUNDOS[index] ?? MUNDOS[0];
          return (
            <Card
              key={index}
              style={[
                styles.badgeCard,
                {
                  borderColor: unlocked ? `${mundo.accent}66` : colors.divider,
                  backgroundColor: unlocked ? colors.background.paper : colors.background.elevated,
                },
              ]}
            >
              <View
                style={[
                  styles.badgeImageWrap,
                  {
                    backgroundColor: unlocked ? `${mundo.accent}1f` : colors.action.disabledBackground,
                    borderColor: unlocked ? `${mundo.accent}55` : 'transparent',
                  },
                ]}
              >
                <Image
                  source={image}
                  style={[styles.badgeImage, !unlocked && styles.badgeImageLocked]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.badgeInfo}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.badgeName, !unlocked && { color: colors.text.disabled }]}
                  numberOfLines={2}
                >
                  {t(`warriorPath.badges.${index}`)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.badgeWorld,
                    { color: unlocked ? mundo.accent : colors.text.disabled },
                  ]}
                >
                  {t('warriorPath.world', { number: index + 1 })}
                </ThemedText>
              </View>
              {!unlocked && (
                <View style={[styles.badgeLock, { backgroundColor: colors.action.selected }]}>
                  <FontAwesome name="lock" size={13} color={colors.text.disabled} />
                </View>
              )}
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
  progressCard: { padding: 18, marginBottom: 12 },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTrack: { height: 12, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  progressCaption: { marginTop: 8, fontSize: 13 },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  missionGluco: { width: 52, height: 52 },
  missionInfo: { flex: 1, minWidth: 0 },
  missionLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  missionTitle: { fontSize: 15 },
  missionWorld: { fontSize: 10.5, fontWeight: '600', marginBottom: 2 },
  missionHint: { fontSize: 12, marginTop: 2 },
  collectionTitle: { fontSize: 18, marginTop: 24, marginBottom: 8 },
  badges: { gap: 4 },
  badgeCard: {
    minHeight: 92,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  badgeImageWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeImage: { width: 42, height: 42 },
  badgeImageLocked: { opacity: 0.35 },
  badgeInfo: { flex: 1, minWidth: 0 },
  badgeName: { fontSize: 14 },
  badgeWorld: { fontSize: 11, fontWeight: '700', marginTop: 3, textTransform: 'uppercase' },
  badgeLock: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
