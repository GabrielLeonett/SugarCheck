import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <FontAwesome name="road" size={32} color={Colors[colorScheme].tint} />
          <ThemedText type="title" style={{ fontSize: 28, marginTop: 8 }}>Camino del Guerrero</ThemedText>
          <ThemedText style={{ opacity: 0.6, textAlign: 'center', marginTop: 4 }}>
            Demuestra tu valía y desbloquea todas las insignias
          </ThemedText>
        </View>

        <Card style={styles.progressCard}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Progreso general</ThemedText>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${PROGRESS}%`, backgroundColor: Colors[colorScheme].tint }]} />
          </View>
          <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.6 }}>{PROGRESS}% completado</ThemedText>
        </Card>

        <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 16 }}>
          Colección de insignias
        </ThemedText>

        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <Card key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}>
              <FontAwesome
                name={badge.icon as any}
                size={32}
                color={badge.unlocked ? Colors[colorScheme].tint : '#999'}
              />
              <ThemedText
                style={[styles.badgeName, { color: badge.unlocked ? Colors[colorScheme].text : '#999' }]}
              >
                {badge.name}
              </ThemedText>
              {!badge.unlocked && (
                <ThemedText style={styles.lockIcon}>
                  <FontAwesome name="lock" size={14} color="#999" />
                </ThemedText>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 100 },
  backButton: { marginBottom: 16, width: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  progressCard: { padding: 24, marginBottom: 24 },
  progressBarBg: { height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', padding: 20, alignItems: 'center', gap: 8 },
  badgeLocked: { opacity: 0.6 },
  badgeName: { fontSize: 13, textAlign: 'center', fontFamily: 'Montserrat-SemiBold' },
  lockIcon: { position: 'absolute', top: 8, right: 8 },
});
