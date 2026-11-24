import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function LegalLinks() {
  const { t } = useTranslation('profile');
  const router = useRouter();

  const links = [
    { label: t('privacyPolicy'), href: '/legal/privacy' },
    { label: t('termsConditions'), href: '/legal/terms' },
    { label: t('cookiePolicy'), href: '/legal/cookies' },
  ];

  return (
    <View style={styles.container}>
      {links.map((item, index) => (
        <View key={item.href} style={styles.item}>
          <TouchableOpacity
            onPress={() => router.push(item.href as never)}
            accessibilityRole="link"
          >
            <ThemedText type="link" style={styles.link}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
          {index < links.length - 1 && (
            <ThemedText muted style={styles.separator}>·</ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { fontSize: 11 },
  separator: { fontSize: 11 },
});
