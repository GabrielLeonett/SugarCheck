import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function AgentScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('screens');
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>
          {t('agent.title')}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <FontAwesome name="android" size={48} color={colors.primary.main} />
          <ThemedText type="h6" style={styles.cardTitle}>
            {t('agent.cardTitle')}
          </ThemedText>
          <ThemedText muted style={styles.description}>
            {t('agent.description')}
          </ThemedText>

          <View style={styles.features}>
            <Feature icon="comments" text={t('agent.personalizedAdvice')} color={colors.primary.main} />
            <Feature icon="bell" text={t('agent.reminders')} color={colors.primary.main} />
            <Feature icon="bar-chart" text={t('agent.trends')} color={colors.primary.main} />
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
