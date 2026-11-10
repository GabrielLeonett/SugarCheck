import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const BADGES = [
  { id: '1', name: 'Primer registro', icon: 'star', unlocked: true, description: 'Registra tu primer nivel de glucosa' },
  { id: '2', name: 'Racha de 7 días', icon: 'fire', unlocked: true, description: '7 días consecutivos de registro' },
  { id: '3', name: 'Dosis perfecta', icon: 'check-circle', unlocked: true, description: 'Registra 10 dosis de insulina' },
  { id: '4', name: 'Control total', icon: 'trophy', unlocked: false, description: 'Mantén tu glucosa en rango por 30 días' },
  { id: '5', name: 'Guerrero experto', icon: 'shield', unlocked: false, description: 'Completa todos los registros por 90 días' },
  { id: '6', name: 'Maestro del IMC', icon: 'balance-scale', unlocked: false, description: 'Registra 20 mediciones físicas' },
  { id: '7', name: 'Conexión familiar', icon: 'users', unlocked: false, description: 'Agrega 3 contactos de emergencia' },
  { id: '8', name: 'Maratón de glucemia', icon: 'road', unlocked: false, description: '100 registros de glucosa' },
];

const PROGRESS = 35;

export default function CaminoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <FontAwesome name="road" size={32} color={colors.primary.main} />
          <ThemedText type="h4" style={styles.title}>
            Camino del Guerrero
          </ThemedText>
          <ThemedText muted style={styles.subtitle}>
            Demuestra tu valía y desbloquea todas las insignias
          </ThemedText>
        </View>

        <Card style={styles.progressCard}>
          <ThemedText type="defaultSemiBold" style={styles.progressTitle}>
            Progreso general
          </ThemedText>
          <View style={[styles.progressBarBg, { backgroundColor: colors.divider }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${PROGRESS}%`, backgroundColor: colors.primary.main },
              ]}
            />
          </View>
          <ThemedText muted style={styles.progressText}>
            {PROGRESS}% completado
          </ThemedText>
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.collectionTitle}>
          Colección de insignias
        </ThemedText>

        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <Card
              key={badge.id}
              style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}
            >
              <FontAwesome
                name={badge.icon as any}
                size={32}
                color={badge.unlocked ? colors.primary.main : colors.text.disabled}
              />
              <ThemedText
                style={[
                  styles.badgeName,
                  { color: badge.unlocked ? colors.text.primary : colors.text.disabled },
                ]}
              >
                {badge.name}
              </ThemedText>
              {!badge.unlocked && (
                <View style={styles.lockIcon}>
                  <FontAwesome name="lock" size={14} color={colors.text.disabled} />
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  backButton: { marginBottom: 16, width: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { marginTop: 8, fontSize: 28 },
  subtitle: { textAlign: 'center', marginTop: 4 },
  progressCard: { padding: 24, marginBottom: 24 },
  progressTitle: { marginBottom: 12 },
  progressBarBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  progressText: { marginTop: 8, fontSize: 14 },
  collectionTitle: { fontSize: 18, marginBottom: 16 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', padding: 20, alignItems: 'center', gap: 8 },
  badgeLocked: { opacity: 0.6 },
  badgeName: { fontSize: 13, textAlign: 'center', fontFamily: Fonts.semiBold },
  lockIcon: { position: 'absolute', top: 8, right: 8 },
});
