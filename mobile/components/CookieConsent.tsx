import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LANGUAGE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  useCookieConsentStore,
} from '@/src/utils/cookieConsent';

export function CookieConsent() {
  const { t, i18n } = useTranslation('legal');
  const { colors, mode, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const consent = useCookieConsentStore((state) => state.consent);
  const hydrated = useCookieConsentStore((state) => state.hydrated);
  const preferencesOpen = useCookieConsentStore((state) => state.preferencesOpen);
  const hydrate = useCookieConsentStore((state) => state.hydrate);
  const save = useCookieConsentStore((state) => state.save);
  const openPreferences = useCookieConsentStore((state) => state.openPreferences);
  const closePreferences = useCookieConsentStore((state) => state.closePreferences);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      hydrate().catch(() => {
        // Si falla la lectura, el aviso se mostrará igualmente.
      });
    }
  }, [hydrated, hydrate]);

  const handleSave = async (preferences: boolean) => {
    setSaving(true);
    try {
      await save(preferences);
      if (preferences) {
        if (mode === 'system') {
          await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        } else {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, colorScheme);
        }
        await AsyncStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          i18n.resolvedLanguage ?? i18n.language,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const showBanner = hydrated && consent === null;

  return (
    <>
      {showBanner && (
        <View
          pointerEvents="box-none"
          style={[styles.overlay, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <Card style={[styles.banner, { borderColor: colors.border }]}>
            <View style={styles.bannerHeader}>
              <FontAwesome name="shield" size={20} color={colors.primary.main} />
              <ThemedText type="h6" style={styles.bannerTitle}>
                {t('consent.title')}
              </ThemedText>
            </View>

            <ThemedText muted style={styles.bannerMessage}>
              {t('consent.message')}
            </ThemedText>

            <TouchableOpacity
              onPress={() => router.push('/legal/cookies')}
              accessibilityRole="link"
            >
              <ThemedText type="link" style={styles.policyLink}>
                {t('consent.policyLink')}
              </ThemedText>
            </TouchableOpacity>

            <Button
              title={t('consent.acceptAll')}
              onPress={() => handleSave(true)}
              disabled={saving}
            />

            <View style={styles.secondaryActions}>
              <Button
                title={t('consent.necessaryOnly')}
                variant="outlined"
                onPress={() => handleSave(false)}
                disabled={saving}
                style={styles.secondaryButton}
              />
              <Button
                title={t('consent.customize')}
                variant="text"
                onPress={openPreferences}
                disabled={saving}
                style={styles.secondaryButton}
              />
            </View>
          </Card>
        </View>
      )}

      {preferencesOpen && (
        <PreferencesModal
          initialPreferences={consent?.preferences ?? true}
          onClose={closePreferences}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function PreferencesModal({
  initialPreferences,
  onClose,
  onSave,
}: {
  initialPreferences: boolean;
  onClose: () => void;
  onSave: (preferences: boolean) => Promise<void>;
}) {
  const { t } = useTranslation('legal');
  const { colors } = useTheme();
  const [preferencesAllowed, setPreferencesAllowed] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preferencesAllowed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible onClose={onClose}>
      <ThemedText type="h6" style={styles.modalTitle}>
        {t('consent.preferencesTitle')}
      </ThemedText>

      <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
        <ThemedText muted style={styles.modalIntro}>
          {t('consent.preferencesIntro')}
        </ThemedText>

        <Card variant="outlined" style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <ThemedText type="defaultSemiBold">{t('consent.necessaryTitle')}</ThemedText>
            <ThemedText muted style={styles.categoryDescription}>
              {t('consent.necessaryDesc')}
            </ThemedText>
          </View>
          <ThemedText style={[styles.alwaysActive, { color: colors.success.main }]}>
            {t('consent.alwaysActive')}
          </ThemedText>
        </Card>

        <Card variant="outlined" style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <ThemedText type="defaultSemiBold">{t('consent.preferencesCatTitle')}</ThemedText>
            <ThemedText muted style={styles.categoryDescription}>
              {t('consent.preferencesCatDesc')}
            </ThemedText>
          </View>
          <Switch
            value={preferencesAllowed}
            onValueChange={setPreferencesAllowed}
            trackColor={{ false: colors.divider, true: colors.primary.main }}
            thumbColor={colors.background.paper}
            ios_backgroundColor={colors.divider}
            accessibilityLabel={t('consent.preferencesCatTitle')}
          />
        </Card>
      </ScrollView>

      <View style={styles.modalActions}>
        <Button
          title={t('consent.cancel')}
          variant="outlined"
          color="secondary"
          onPress={onClose}
          style={styles.modalActionButton}
        />
        <Button
          title={t('consent.save')}
          onPress={handleSave}
          loading={saving}
          style={styles.modalActionButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
  },
  banner: {
    padding: 16,
    marginBottom: 4,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bannerTitle: { flex: 1, fontSize: 17 },
  bannerMessage: { fontSize: 13, marginBottom: 6 },
  policyLink: { fontSize: 13, marginBottom: 12 },
  secondaryActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryButton: { flex: 1 },
  modalTitle: { textAlign: 'center', marginBottom: 12 },
  modalScroll: { maxHeight: 400 },
  modalIntro: { fontSize: 13, marginBottom: 10 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
  },
  categoryInfo: { flex: 1 },
  categoryDescription: { fontSize: 12, marginTop: 2 },
  alwaysActive: { fontSize: 12, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalActionButton: { flex: 1 },
});
