import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { preferenceApi } from '@/src/apis/preference';
import { contactEmergenceApi } from '@/src/apis/contact-emergence';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

export default function CompleteProfileScreen() {
  const { t } = useTranslation(['auth', 'common', 'profile']);
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    peso: '',
    talla: '',
    glucosaMin: '',
    glucosaMax: '',
    nombreGuardian: '',
    parentesco: '',
    telefono: '',
  });
  const updateField = (key: string, value: any) =>
    setFormData((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (formData.peso && formData.talla) {
        await preferenceApi
          .savePreferences({
            userId: useAuthStore.getState().user?.id || '',
            profileImg: 'default',
            unitMeasure: 'mg/dL',
            thresholds: {
              hypo: Number(formData.glucosaMin) || 70,
              hiper: Number(formData.glucosaMax) || 180,
            },
            locale: 'es',
            theme: 'light',
          } as any)
          .catch(() => {});
      }

      if (formData.nombreGuardian) {
        await contactEmergenceApi
          .create({
            name: formData.nombreGuardian,
            parentesco: formData.parentesco || 'otro',
            telefono: formData.telefono || undefined,
          })
          .catch(() => {});
      }

      router.replace('/(tabs)');
    } catch {
      showErrorAlert(t('auth:registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="h4" style={styles.title}>
          {t('auth:completeProfileTitle')}
        </ThemedText>
        <ThemedText muted style={styles.subtitle}>
          {t('auth:completeProfileSubtitle')}
        </ThemedText>

        <View style={styles.form}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {t('auth:healthData')}
          </ThemedText>

          <FormInput
            label={t('auth:weight')}
            value={formData.peso}
            onChangeText={(value) => updateField('peso', value)}
            placeholder="Ej: 70"
            keyboardType="numeric"
          />
          <FormInput
            label={t('auth:height')}
            value={formData.talla}
            onChangeText={(value) => updateField('talla', value)}
            placeholder="Ej: 170"
            keyboardType="numeric"
          />
          <FormInput
            label={t('auth:minimumGlucose')}
            value={formData.glucosaMin}
            onChangeText={(value) => updateField('glucosaMin', value)}
            placeholder="Ej: 70"
            keyboardType="numeric"
          />
          <FormInput
            label={t('auth:maximumGlucose')}
            value={formData.glucosaMax}
            onChangeText={(value) => updateField('glucosaMax', value)}
            placeholder="Ej: 180"
            keyboardType="numeric"
          />

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {t('auth:emergencyContact')}
          </ThemedText>

          <FormInput
            label={t('auth:contactName')}
            value={formData.nombreGuardian}
            onChangeText={(value) => updateField('nombreGuardian', value)}
            placeholder={t('auth:contactPlaceholder')}
            autoCapitalize="words"
          />
          <FormInput
            label={t('profile:relationship')}
            value={formData.parentesco}
            onChangeText={(value) => updateField('parentesco', value)}
            placeholder={t('profile:relationshipPlaceholder')}
          />
          <FormInput
            label={t('auth:phoneOptional')}
            value={formData.telefono}
            onChangeText={(value) => updateField('telefono', value)}
            placeholder={t('profile:phonePlaceholder')}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.buttons}>
          <Button title={t('auth:skip')} onPress={handleSkip} variant="outlined" style={styles.button} />
          <Button title={t('common:save')} onPress={handleSubmit} loading={isSubmitting} style={styles.button} />
        </View>

        <ThemedText muted style={[styles.footer, { color: colors.text.secondary }]}>
          {t('auth:completeProfileLater')}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  form: { gap: 4 },
  sectionTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Fonts.bold,
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 12 },
});
