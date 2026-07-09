import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AgentScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Oráculo Azul</ThemedText>
      </View>
      <View style={styles.content}>
        <Card style={styles.card}>
          <FontAwesome name="android" size={48} color={Colors[colorScheme].tint} />
          <ThemedText type="title" style={{ fontSize: 20, marginTop: 16, textAlign: 'center' }}>
            Tu asistente inteligente
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.7, lineHeight: 22 }}>
            El Oráculo Azul te ayudará a interpretar tus niveles de glucosa, recomendarte comidas y recordarte tus dosis de insulina.
          </ThemedText>
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <FontAwesome name="comments" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={{ marginLeft: 12, flex: 1 }}>Consejos personalizados</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome name="bell" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={{ marginLeft: 12, flex: 1 }}>Recordatorios inteligentes</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome name="bar-chart" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={{ marginLeft: 12, flex: 1 }}>Análisis de tendencias</ThemedText>
            </View>
          </View>
        </Card>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  card: { padding: 32, alignItems: 'center' },
  features: { marginTop: 24, width: '100%', gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
});
