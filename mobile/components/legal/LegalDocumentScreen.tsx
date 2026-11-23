import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useCookieConsentStore } from '@/src/utils/cookieConsent';

type LegalDocument = 'privacy' | 'terms' | 'cookies';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPage {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

interface StorageTable {
  headers: string[];
  rows: {
    name: string;
    purpose: string;
    duration: string;
    type: string;
  }[];
}

export function LegalDocumentScreen({ document }: { document: LegalDocument }) {
  const { t } = useTranslation('legal');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openPreferences = useCookieConsentStore((state) => state.openPreferences);

  const content = t(document, { returnObjects: true }) as unknown as LegalPage;
  const storageTable = document === 'cookies'
    ? (t('cookies.storageTable', { returnObjects: true }) as unknown as StorageTable)
    : null;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/perfil');
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: colors.divider,
            backgroundColor: colors.background.paper,
          },
        ]}
      >
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
        >
          <FontAwesome name="chevron-left" size={20} color={colors.primary.main} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.headerTitle}>
          {content.title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.title}>
          {content.title}
        </ThemedText>
        <ThemedText muted style={styles.updated}>
          {content.updated}
        </ThemedText>

        <ThemedText muted style={styles.intro}>
          {content.intro}
        </ThemedText>

        {document === 'cookies' && (
          <>
            <Button
              title={t('managePreferences')}
              variant="outlined"
              onPress={openPreferences}
              icon={<FontAwesome name="sliders" size={16} color={colors.primary.main} />}
            />

            {storageTable && (
              <View style={styles.tableSection}>
                <ThemedText type="h6" style={[styles.tableTitle, { color: colors.primary.main }]}>
                  {t('cookies.tableTitle')}
                </ThemedText>

                {storageTable.rows.map((row) => (
                  <Card key={row.name} variant="outlined" style={styles.storageCard}>
                    <ThemedText type="defaultSemiBold" style={styles.storageName}>
                      {row.name}
                    </ThemedText>
                    <ThemedText muted style={styles.storageType}>
                      {row.type}
                    </ThemedText>
                    <ThemedText muted style={styles.storagePurpose}>
                      {row.purpose}
                    </ThemedText>
                    <View style={styles.storageMetaRow}>
                      <ThemedText muted style={styles.storageMetaLabel}>
                        {storageTable.headers[2]}:
                      </ThemedText>
                      <ThemedText muted style={styles.storageMetaValue}>
                        {row.duration}
                      </ThemedText>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.sections}>
          {content.sections.map((section, sectionIndex) => (
            <View key={`${section.title}-${sectionIndex}`} style={styles.section}>
              <ThemedText
                type="h6"
                style={[styles.sectionTitle, { color: colors.primary.main }]}
              >
                {sectionIndex + 1}. {section.title}
              </ThemedText>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <ThemedText
                  key={`${sectionIndex}-${paragraphIndex}`}
                  muted
                  style={styles.paragraph}
                >
                  {paragraph}
                </ThemedText>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15 },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  title: { marginBottom: 4 },
  updated: { fontSize: 12, marginBottom: 16 },
  intro: { marginBottom: 20 },
  tableSection: { marginTop: 20 },
  tableTitle: { marginBottom: 4 },
  storageCard: {
    borderRadius: Shape.cardRadius,
    padding: 14,
  },
  storageName: { fontSize: 14 },
  storageType: { fontSize: 12, marginTop: 2 },
  storagePurpose: { fontSize: 13, marginTop: 8 },
  storageMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  storageMetaLabel: { fontSize: 12 },
  storageMetaValue: { fontSize: 12, flexShrink: 1 },
  sections: { marginTop: 24, gap: 24 },
  section: {},
  sectionTitle: { marginBottom: 8 },
  paragraph: { marginBottom: 8, lineHeight: 22 },
});
