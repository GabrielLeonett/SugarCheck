import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function AgentScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>
          Oráculo Azul
        </ThemedText>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <FontAwesome name="android" size={48} color={colors.primary.main} />
          <ThemedText type="h6" style={styles.cardTitle}>
            Tu asistente inteligente
          </ThemedText>
          <ThemedText muted style={styles.description}>
            El Oráculo Azul te ayudará a interpretar tus niveles de glucosa, recomendarte comidas y
            recordarte tus dosis de insulina.
          </ThemedText>

          <View style={styles.features}>
            <Feature icon="comments" text="Consejos personalizados" color={colors.primary.main} />
            <Feature icon="bell" text="Recordatorios inteligentes" color={colors.primary.main} />
            <Feature icon="bar-chart" text="Análisis de tendencias" color={colors.primary.main} />
          </View>
        </Card>
      </View>
    </ThemedView>
  );
}

function Feature({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={styles.featureItem}>
      <FontAwesome name={icon as any} size={20} color={color} />
      <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  card: { padding: 32, alignItems: 'center' },
  cardTitle: { marginTop: 16, textAlign: 'center' },
  description: { textAlign: 'center', marginTop: 8, lineHeight: 22 },
  features: { marginTop: 24, width: '100%', gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureText: { marginLeft: 12, flex: 1, fontFamily: Fonts.regular },
});
