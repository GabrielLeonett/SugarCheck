import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PathMap } from '@/components/camino/PathMap';
import { PathMission } from '@/components/camino/PathMission';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GLUCO_GESTURES } from '@/constants/gestures';
import { useTheme } from '@/contexts/ThemeContext';
import {
  completarNivelCamino,
  getCaminoProgreso,
} from '@/src/apis/camino';
import {
  showErrorAlert,
  showSuccessAlert,
} from '@/src/stores/systemAlertStore';

const TOTAL_LEVELS = 15;

export default function CaminoScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['screens', 'common']);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lastCompletedLevel, setLastCompletedLevel] = useState(0);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const progress = await getCaminoProgreso();
      const completed = Number(progress.ultimoNivelCompletado);
      if (!Number.isInteger(completed) || completed < 0 || completed > TOTAL_LEVELS) {
        throw new Error('Invalid Camino progress returned by API.');
      }
      setLastCompletedLevel(completed);
    } catch (error) {
      console.error('No se pudo cargar el progreso del Camino:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const completeLevel = async (level: number): Promise<boolean> => {
    if (level > lastCompletedLevel + 1) {
      showErrorAlert(t('warriorPath.locked', { ns: 'screens' }));
      return false;
    }

    try {
      await completarNivelCamino(level);
      const nextCompleted = Math.max(lastCompletedLevel, level);
      const previousBadgeCount = Math.floor(lastCompletedLevel / 3);
      const nextBadgeCount = Math.floor(nextCompleted / 3);
      setLastCompletedLevel(nextCompleted);
      setActiveLevel(null);

      if (nextBadgeCount > previousBadgeCount) {
        showSuccessAlert(
          t('warriorPath.badgeUnlockedDescription', {
            ns: 'screens',
            badge: t(`warriorPath.badges.${nextBadgeCount - 1}`, { ns: 'screens' }),
          }),
          t('warriorPath.badgeUnlocked', { ns: 'screens' }),
          undefined,
          GLUCO_GESTURES.sorpresaTotal
        );
      } else {
        showSuccessAlert(
          t('warriorPath.levelCompleted', { ns: 'screens', level }),
          t('warriorPath.levelCompletedTitle', { ns: 'screens' }),
          undefined,
          GLUCO_GESTURES.ataqueVictoria
        );
      }
      return true;
    } catch (error) {
      console.error('No se pudo guardar el nivel del Camino:', error);
      return false;
    }
  };

  const returnToTabs = () => {
    if (router.canGoBack()) {
      router.dismissTo('/(tabs)');
      return;
    }

    router.replace('/(tabs)');
  };

  if (activeLevel !== null) {
    return (
      <PathMission
        key={activeLevel}
        level={activeLevel}
        onExit={() => setActiveLevel(null)}
        onComplete={completeLevel}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={returnToTabs}
          style={styles.backButton}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('back', { ns: 'common' })}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.topTitle}>
          {t('warriorPath.title', { ns: 'screens' })}
        </ThemedText>
        <View style={styles.backButton} />
      </View>
      <PathMap
        lastCompletedLevel={lastCompletedLevel}
        loading={loading}
        error={loadError ? t('warriorPath.loadError', { ns: 'screens' }) : null}
        onRetry={loadProgress}
        onSelectLevel={setActiveLevel}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center' },
});
