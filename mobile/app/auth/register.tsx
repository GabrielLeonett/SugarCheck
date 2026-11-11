import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { authApi } from '@/src/apis/auth';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

export default function RegisterScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    sexo: '',
    fechaNacimiento: new Date(2000, 0, 1),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: any) =>
    setFormData((previous) => ({ ...previous, [key]: value }));

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.nombre) errs.nombre = t('auth:nameRequired');
    if (!formData.sexo) errs.sexo = t('auth:selectSex');
    if (!formData.email) errs.email = t('auth:emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = t('auth:emailInvalid');
    if (!formData.password) errs.password = t('auth:passwordRequired');
    else if (formData.password.length < 6) errs.password = t('auth:passwordMin');
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = t('auth:passwordsMismatch');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);
    try {
      await authApi.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        sexo: formData.sexo,
        fechaNacimiento: formData.fechaNacimiento.toISOString(),
      });

      await login(formData.email, formData.password);
      router.push('/auth/complete-profile');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || t('auth:registerError');
      showErrorAlert(message);
    } finally {
      setIsSubmitting(false);
    }
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="h4" style={styles.title}>
          {t('auth:registerTitle')}
        </ThemedText>

        <View style={styles.form}>
          <FormInput
            label={t('auth:fullName')}
            value={formData.nombre}
            onChangeText={(value) => updateField('nombre', value)}
            placeholder={t('auth:yourName')}
            autoCapitalize="words"
            error={errors.nombre}
          />
          <FormInput
            label={t('common:email')}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder={t('auth:emailPlaceholder')}
            keyboardType="email-address"
            error={errors.email}
          />
          <FormInput
            label={t('common:password')}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="••••••"
            secureTextEntry
            error={errors.password}
          />
          <FormInput
            label={t('auth:confirmPassword')}
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            placeholder="••••••"
            secureTextEntry
            error={errors.confirmPassword}
          />
          <FormInput
            label={t('common:sex')}
            value={formData.sexo}
            onChangeText={(value) => updateField('sexo', value)}
            placeholder={t('auth:sexPlaceholder')}
            error={errors.sexo}
          />
          <DatePickerField
            label={t('common:dateOfBirth')}
            value={formData.fechaNacimiento}
            onChange={(date) => updateField('fechaNacimiento', date)}
          />
        </View>

        <View style={styles.buttons}>
          <Button title={t('auth:register')} onPress={handleSubmit} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            {t('auth:alreadyAccount')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text style={[styles.link, { color: colors.primary.main, marginLeft: 4 }]}>
              {t('auth:login')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  backButton: { marginBottom: 16, width: 40 },
  title: { textAlign: 'center', marginBottom: 24 },
  form: { gap: 4 },
  buttons: { marginTop: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontFamily: Fonts.regular },
  link: { fontFamily: Fonts.semiBold, fontSize: 14 },
});
