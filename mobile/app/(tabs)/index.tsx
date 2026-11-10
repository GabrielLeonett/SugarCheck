import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckSquare, ChevronUp, Menu } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { H5 } from '@/components/ui/h5';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { glucoseApi } from '@/src/apis/glucose';
import type { GlucoseEntry } from '@/src/apis/glucose';

function formatRelativeTime(timestamp: Date): string {
  const diffMinutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 7)} semanas`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [lastEntry, setLastEntry] = useState<GlucoseEntry | null>(null);

  const loadLastEntry = useCallback(async () => {
    try {
      const records = await glucoseApi.getAll();
      setLastEntry(records[0] ?? null);
    } catch {
      setLastEntry(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLastEntry();
    }, [loadLastEntry])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.primary.main }]}>Home</Text>
        </View>

        <Text style={[styles.greeting, { color: colors.text.primary }]}>
          ¡Hola, Guerrero {user?.name || 'David'}!
        </Text>

        <Card style={[styles.mainCard, { backgroundColor: colors.surface }]}>
          <H5 style={[styles.cardTitle, { color: colors.accent.blue }]}>Última Batalla</H5>

          <View style={styles.glucoseContainer}>
            <Text style={[styles.glucoseValue, { color: colors.success.main }]}>
              {lastEntry ? lastEntry.nivel : '--'}
            </Text>
            <View style={styles.glucoseUnitWrapper}>
              <ChevronUp color={colors.success.main} size={32} strokeWidth={3} />
              <Text style={[styles.glucoseUnit, { color: colors.success.main }]}>mg/dL</Text>
            </View>
          </View>

          <Text style={[styles.timeSubtitle, { color: colors.success.main }]}>
            {lastEntry
              ? `${formatRelativeTime(lastEntry.timestamp)}${lastEntry.contexto ? ` (${lastEntry.contexto})` : ''}`
              : 'Sin registros'}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <H5 style={[styles.cardTitle, styles.timerTitle, { color: colors.accent.blue }]}>
            Cronómetro de Seguridad
          </H5>
          <Text style={[styles.insulinSubtitle, { color: colors.text.secondary }]}>
            Última Insulina Rápida
          </Text>

          <View style={styles.timerContainer}>
            <Text style={[styles.timerValue, { color: colors.success.main }]}>2:15</Text>
            <Text style={[styles.timerUnit, { color: colors.success.main }]}>Horas transcurridas</Text>
          </View>

          <Text style={[styles.safeZoneText, { color: colors.success.main }]}>Zona Segura</Text>
        </Card>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 40,
    fontFamily: Fonts.extraBold,
  },
  greeting: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 20,
  },
  mainCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
    elevation: 0,
    boxShadow: 'none',
  },
  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginBottom: 12,
  },
  timerTitle: {
    width: '70%',
  },
  glucoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glucoseValue: {
    fontSize: 80,
    fontFamily: Fonts.extraBold,
    lineHeight: 85,
  },
  glucoseUnitWrapper: {
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 10,
  },
  glucoseUnit: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  timeSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  insulinSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerValue: {
    fontSize: 64,
    fontFamily: Fonts.extraBold,
    lineHeight: 70,
  },
  timerUnit: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginLeft: 8,
  },
  safeZoneText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  missionCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
    elevation: 0,
    boxShadow: 'none',
  },
  missionSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    marginBottom: 16,
  },
  checkList: {
    gap: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
