import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/src/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { H5 } from '@/components/ui/h5';

const screenWidth = Dimensions.get('window').width;

const MOCK_GLUCOSE_DATA = [120, 145, 98, 156, 132, 110, 95];
const MOCK_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const getLevelStatus = (level: number) => {
    if (level < 70) return { label: 'Hipoglucemia', color: '#d32f2f' };
    if (level > 180) return { label: 'Hiperglucemia', color: '#f57c00' };
    return { label: 'Normal', color: '#2e7d32' };
  };

  const lastLevel = MOCK_GLUCOSE_DATA[MOCK_GLUCOSE_DATA.length - 1];
  const status = getLevelStatus(lastLevel);
  const inRange = MOCK_GLUCOSE_DATA.filter((v) => v >= 70 && v <= 180).length;
  const safePercent = Math.round((inRange / MOCK_GLUCOSE_DATA.length) * 100);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <H5>
              Bienvenido, {user?.name || 'Guerrero'}
            </H5>
          </View>
          <FontAwesome name="shield" size={32} color={Colors[colorScheme].tint} />
        </View>

        <Card style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Última batalla</ThemedText>
            <FontAwesome name="heartbeat" size={20} color={Colors[colorScheme].tint} />
          </View>
          <View style={styles.levelContainer}>
            <ThemedText type="title" style={{ fontSize: 48, color: status.color }}>
              {lastLevel}
            </ThemedText>
            <ThemedText style={{ fontSize: 18, color: status.color }}>mg/dL</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <ThemedText style={{ color: status.color, fontSize: 14 }}>{status.label}</ThemedText>
          </View>
          <ThemedText style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
            Hace 2 horas
          </ThemedText>
        </Card>

        <View style={styles.cardsRow}>
          <Card style={[styles.smallCard, { flex: 1 }]}>
            <FontAwesome name="clock-o" size={24} color={Colors[colorScheme].tint} />
            <ThemedText type="defaultSemiBold" style={{ fontSize: 13, marginTop: 8 }}>
              Cronómetro
            </ThemedText>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              03:45
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>Desde última dosis</ThemedText>
          </Card>
          <Card style={[styles.smallCard, { flex: 1 }]}>
            <FontAwesome name="check-circle" size={24} color="#2e7d32" />
            <ThemedText type="defaultSemiBold" style={{ fontSize: 13, marginTop: 8 }}>
              Zona segura
            </ThemedText>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {safePercent}%
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>Esta semana</ThemedText>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <View style={styles.mainCardHeader}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Historial semanal</ThemedText>
            <FontAwesome name="line-chart" size={18} color={Colors[colorScheme].tint} />
          </View>
          <View style={styles.simpleChart}>
            {MOCK_GLUCOSE_DATA.map((value, index) => {
              const maxVal = Math.max(...MOCK_GLUCOSE_DATA);
              const height = (value / maxVal) * 120;
              const isNormal = value >= 70 && value <= 180;
              return (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 8),
                        backgroundColor: isNormal ? Colors[colorScheme].tint : status.color,
                        opacity: 0.8,
                      },
                    ]}
                  />
                  <ThemedText style={{ fontSize: 9, marginTop: 4 }}>{MOCK_LABELS[index]}</ThemedText>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <View style={styles.mainCardHeader}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Balance físico</ThemedText>
            <FontAwesome name="balance-scale" size={18} color={Colors[colorScheme].tint} />
          </View>
          <View style={styles.bmiRow}>
            <ThemedText style={{ fontSize: 36, fontWeight: 'bold' }}>21.7</ThemedText>
            <ThemedText style={{ fontSize: 14, opacity: 0.6, marginLeft: 8 }}>IMC - Normal</ThemedText>
          </View>
        </Card>

        <View style={styles.quickActions}>
          <Button
            title="Registrar Glucosa"
            onPress={() => router.push('/bitacora/glucosa' as any)}
            icon={<FontAwesome name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Insulina"
            onPress={() => router.push('/bitacora/insulina' as any)}
            variant="outlined"
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainCard: { padding: 20, marginBottom: 12 },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallCard: { padding: 16, alignItems: 'center' },
  chartCard: { padding: 20, marginBottom: 12 },
  simpleChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginTop: 16, paddingHorizontal: 4 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: 6, minHeight: 8 },
  bmiRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  quickActions: { flexDirection: 'row', marginTop: 8 },
});
