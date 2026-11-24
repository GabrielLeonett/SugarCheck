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
import { CaminoWorldDecor } from './CaminoWorldDecor';
import { CAMINO_WORLDS, withAlpha } from './caminoWorlds';

const BADGES = [
  require('../../assets/insigniasCamino/escudo_de_fribra.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
  require('../../assets/insigniasCamino/yelmo_de_sabiduria.png'),
];

const HEX_POINTS = '38,2 72,19 72,53 38,70 4,53 4,19';

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
          <ThemedText style={[styles.retryText, { color: colors.primary.contrastText }]}>{t('warriorPath.retry')}</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Resumen del camino */}
      <Card style={styles.hero}>
        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor: withAlpha(colors.primary.main, 0.12),
              borderColor: withAlpha(colors.primary.main, 0.24),
            },
          ]}
        >
          <Image
            source={require('../../assets/tabbar/colina.png')}
            style={styles.pathIcon}
            resizeMode="contain"
          />
        </View>
        <ThemedText muted style={styles.subtitle}>
          {t('warriorPath.subtitle')}
        </ThemedText>
        <View style={styles.progressHeading}>
          <ThemedText type="defaultSemiBold">{t('warriorPath.progress')}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: colors.primary.dark }}>
            {progressPercent}%
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: withAlpha(colors.primary.main, 0.18) }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: colors.primary.main },
            ]}
          />
        </View>
        <ThemedText muted style={styles.progressCaption}>
          {t('warriorPath.completed', { percent: progressPercent, levels: lastCompletedLevel })}
        </ThemedText>
      </Card>

      {/* Mundos */}
      <View style={styles.mapSection}>
        {CAMINO_WORLDS.map((world) => {
          const accent = colors.world[world.accentKey];
          const firstLevel = (world.number - 1) * 3 + 1;
          const completedInWorld = Math.max(
            0,
            Math.min(3, lastCompletedLevel - firstLevel + 1)
          );

          return (
            <Card
              key={world.number}
              style={[
                styles.worldCard,
                { borderColor: withAlpha(accent, 0.22) },
              ]}
            >
              <CaminoWorldDecor
                world={world.number}
                accent={accent}
                contrast={colors.onAccent}
                height={185}
              />

              <View style={styles.worldContent}>
                <View style={styles.worldHeader}>
                  <View
                    style={[
                      styles.worldMedallion,
                      {
                        backgroundColor: withAlpha(accent, 0.14),
                        borderColor: withAlpha(accent, 0.3),
                      },
                    ]}
                  >
                    <FontAwesome name={world.icon} size={19} color={accent} />
                  </View>

                  <View style={styles.worldTitleWrap}>
                    <ThemedText style={[styles.worldOverline, { color: accent }]}>
                      {t('warriorPath.world', { number: world.number })}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.worldTitle} numberOfLines={2}>
                      {t(`warriorPath.worlds.${world.titleKey}`)}
                    </ThemedText>
                  </View>

                  <View style={styles.worldProgress}>
                    <View style={styles.worldDots}>
                      {[0, 1, 2].map((dot) => (
                        <View
                          key={dot}
                          style={[
                            styles.worldDot,
                            {
                              backgroundColor:
                                dot < completedInWorld
                                  ? accent
                                  : withAlpha(accent, 0.22),
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <ThemedText muted style={styles.worldCount}>
                      {completedInWorld}/3
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.worldDivider, { backgroundColor: withAlpha(accent, 0.22) }]} />

                <View style={styles.levels}>
                  {Array.from({ length: 3 }, (_, index) => {
                    const level = firstLevel + index;
                    const completed = level <= lastCompletedLevel;
                    const available = level <= lastCompletedLevel + 1;
                    const isCurrent = available && !completed;
                    const fill = completed
                      ? colors.success.main
                      : available
                        ? accent
                        : colors.action.disabledBackground;
                    const stroke = completed
                      ? colors.success.dark
                      : available
                        ? accent
                        : colors.border;
                    const contentColor = completed
                      ? colors.success.contrastText
                      : available
                        ? colors.text.inverse
                        : colors.text.disabled;

                    return (
                      <View
                        key={level}
                        style={[
                          styles.levelRow,
                          index % 2 === 0 ? styles.levelRowLeft : styles.levelRowRight,
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => onSelectLevel(level)}
                          disabled={!available}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: !available }}
                          accessibilityLabel={`${t('warriorPath.level', { number: level })}: ${t(
                            completed
                              ? 'warriorPath.completedLevel'
                              : available
                                ? 'warriorPath.available'
                                : 'warriorPath.locked'
                          )}`}
                          style={[styles.levelButton, !available && styles.lockedLevel]}
                        >
                          <View style={styles.hexWrap}>
                            <Svg width={76} height={72} viewBox="0 0 76 72">
                              <Polygon
                                points={HEX_POINTS}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={3}
                                strokeLinejoin="round"
                              />
                            </Svg>
                            <View style={styles.hexContent}>
                              {completed ? (
                                <FontAwesome name="check" size={22} color={contentColor} />
                              ) : available ? (
                                <ThemedText style={[styles.hexNumber, { color: contentColor }]}>
                                  {level}
                                </ThemedText>
                              ) : (
                                <FontAwesome name="lock" size={16} color={colors.text.disabled} />
                              )}
                            </View>
                          </View>

                          <ThemedText
                            numberOfLines={2}
                            style={[
                              styles.levelTitle,
                              available ? { color: colors.text.primary } : { color: colors.text.disabled },
                              completed && styles.levelTitleCompleted,
                            ]}
                          >
                            {t(`warriorPath.lessonTitles.${level}`, {
                              defaultValue:
                                leccionesPorNivel[level]?.titulo ??
                                t('warriorPath.level', { number: level }),
                            })}
                          </ThemedText>

                          {isCurrent && (
                            <View
                              style={[
                                styles.availablePill,
                                { backgroundColor: withAlpha(accent, 0.14) },
                              ]}
                            >
                              <ThemedText style={[styles.availableText, { color: accent }]}>
                                {t('warriorPath.available')}
                              </ThemedText>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Insignias */}
      <Card style={styles.badgesCard}>
        <View style={styles.badgesHeader}>
          <View
            style={[
              styles.badgesIcon,
              {
                backgroundColor: withAlpha(colors.primary.main, 0.14),
                borderColor: withAlpha(colors.primary.main, 0.28),
              },
            ]}
          >
            <FontAwesome name="trophy" size={18} color={colors.primary.main} />
          </View>
          <View style={styles.badgesHeaderCopy}>
            <ThemedText type="defaultSemiBold" style={styles.collectionTitle}>
              {t('warriorPath.collection')}
            </ThemedText>
            <ThemedText muted style={styles.badgesCount}>
              {unlockedBadges} / {BADGES.length}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.badgeProgressTrack, { backgroundColor: withAlpha(colors.primary.main, 0.16) }]}>
          <View
            style={[
              styles.badgeProgressFill,
              {
                width: `${(unlockedBadges / BADGES.length) * 100}%`,
                backgroundColor: colors.primary.main,
              },
            ]}
          />
        </View>

        <View style={styles.badgesList}>
          {BADGES.map((image, index) => {
            const unlocked = index < unlockedBadges;
            return (
              <View
                key={index}
                style={[
                  styles.badgeRow,
                  {
                    borderColor: unlocked
                      ? withAlpha(colors.primary.main, 0.26)
                      : colors.border,
                    backgroundColor: unlocked
                      ? withAlpha(colors.primary.main, 0.06)
                      : colors.action.hover,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeImageWrap,
                    {
                      backgroundColor: unlocked
                        ? withAlpha(colors.primary.main, 0.14)
                        : colors.action.disabledBackground,
                      borderColor: unlocked
                        ? withAlpha(colors.primary.main, 0.3)
                        : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={image}
                    style={[styles.badgeImage, !unlocked && styles.badgeImageLocked]}
                    resizeMode="contain"
                  />
                  {!unlocked && (
                    <View
                      style={[
                        styles.badgeLock,
                        {
                          backgroundColor: colors.background.paper,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <FontAwesome name="lock" size={11} color={colors.text.disabled} />
                    </View>
                  )}
                </View>

                <View style={styles.badgeCopy}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.badgeName, !unlocked && { color: colors.text.disabled }]}
                  >
                    {t(`warriorPath.badges.${index}`)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.badgeWorld,
                      { color: unlocked ? colors.primary.main : colors.text.disabled },
                    ]}
                  >
                    {t('warriorPath.world', { number: index + 1 })}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  stateText: { marginTop: 12, textAlign: 'center' },
  errorText: { textAlign: 'center', maxWidth: 320 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { fontWeight: '600' },

  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  pathIcon: { width: 38, height: 38 },
  subtitle: { textAlign: 'center', fontSize: 13, marginBottom: 18, paddingHorizontal: 8 },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  progressTrack: { height: 10, borderRadius: 6, overflow: 'hidden', alignSelf: 'stretch' },
  progressFill: { height: '100%', borderRadius: 6 },
  progressCaption: { marginTop: 8, fontSize: 12, textAlign: 'center' },

  mapSection: { marginTop: 8 },
  worldCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 8,
  },
  worldContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  worldHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  worldMedallion: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldTitleWrap: { flex: 1, minWidth: 0 },
  worldOverline: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  worldTitle: { fontSize: 15, lineHeight: 20, marginTop: 1 },
  worldProgress: { alignItems: 'flex-end', gap: 4 },
  worldDots: { flexDirection: 'row', gap: 4 },
  worldDot: { width: 7, height: 7, borderRadius: 4 },
  worldCount: { fontSize: 11 },
  worldDivider: { height: 1, marginTop: 12, marginBottom: 6 },

  levels: { paddingBottom: 2 },
  levelRow: { paddingVertical: 6 },
  levelRowLeft: { alignItems: 'flex-start', paddingLeft: 10 },
  levelRowRight: { alignItems: 'flex-end', paddingRight: 10 },
  levelButton: { width: 136, alignItems: 'center' },
  lockedLevel: { opacity: 0.85 },
  hexWrap: { width: 76, height: 72, alignItems: 'center', justifyContent: 'center' },
  hexContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexNumber: { fontSize: 23, lineHeight: 27, fontWeight: '700' },
  levelTitle: {
    marginTop: 3,
    width: 136,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    fontWeight: '600',
    minHeight: 30,
  },
  levelTitleCompleted: { fontWeight: '700' },
  availablePill: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availableText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  badgesCard: { padding: 0, overflow: 'hidden', marginTop: 16 },
  badgesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  badgesIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesHeaderCopy: { flex: 1 },
  collectionTitle: { fontSize: 16 },
  badgesCount: { fontSize: 12, marginTop: 1 },
  badgeProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 14,
    marginBottom: 12,
  },
  badgeProgressFill: { height: '100%', borderRadius: 4 },
  badgesList: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  badgeImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: { width: 40, height: 40 },
  badgeImageLocked: { opacity: 0.35 },
  badgeLock: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeCopy: { flex: 1 },
  badgeName: { fontSize: 14, lineHeight: 19 },
  badgeWorld: { fontSize: 11, lineHeight: 15, fontWeight: '600', letterSpacing: 0.5, marginTop: 1 },
});
