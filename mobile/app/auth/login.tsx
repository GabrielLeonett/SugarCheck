import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { FormInput } from '@/components/FormInput';
import { LegalLinks } from '@/components/legal/LegalLinks';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { H1, H2, Body1, H4 } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore } from '@/src/stores/guestStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function LoginScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const pendingImport = useGuestStore((s) => s.pendingImport);
  const loginWithProvider = useAuthStore((s) => s.loginWithProvider);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username) errs.username = t('auth:usernameRequired');
    else if (username.length < 3) errs.username = t('auth:usernameMin');
    else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(username)) errs.username = t('auth:usernameInvalid');
    if (!password) errs.password = t('auth:passwordRequired');
    else if (password.length < 8) errs.password = t('auth:passwordMin');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(username, password);
      if (useGuestStore.getState().pendingImport) {
        router.replace('/auth/import-guest');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || t('auth:loginError');
      showErrorAlert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      await loginWithProvider(provider);
      const isNew = useAuthStore.getState().isNewUser;
      useAuthStore.getState().clearNewUserFlag();
      if (useGuestStore.getState().pendingImport) {
        router.replace('/auth/import-guest');
      } else if (isNew) {
        router.replace('/auth/complete-profile');
      }
    } catch (error: any) {
      showErrorAlert(error?.message || t('auth:socialLoginError', { provider }));
    } finally {
      setSocialLoading(null);
    }
  };

  if (user) {
    return <Redirect href={pendingImport ? '/auth/import-guest' : '/(tabs)'} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <LanguageSelector />
          <Image
            source={require('../../assets/icons/SugarCheck.svg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <H2 style={[styles.appTitle, { color: colors.primary.main }]}>
            SugarCheck
          </H2>
          <ThemedText muted style={styles.subtitle}>{t('auth:loginSubtitle')}</ThemedText>
        </View>

        {/* Tarjeta: bienvenida */}
        <Card style={styles.card}>
          <Image
            source={require('../../assets/gluco-saludo.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
          <H1 style={[styles.welcomeTitle, { color: colors.primary.main }]}>
            {t('auth:welcome')}
          </H1>
          <Body1 style={styles.welcomeBody}>
            {t('auth:welcomeBody')}
          </Body1>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>
              {t('auth:noAccount')} {t('auth:signUp')}
            </ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Tarjeta: formulario de acceso (fondo primary del sistema) */}
        <Card style={[styles.card, { backgroundColor: colors.primary.dark }]}>
          <H4 style={[styles.formTitle, { color: colors.text.inverse }]}>
            {t('auth:login')}
          </H4>
          <ThemedText style={[styles.formSubtitle, { color: colors.text.inverse }]}>
            {t('auth:loginInstructions')}
          </ThemedText>
          <FormInput
            label={t('auth:username')}
            value={username}
            onChangeText={setUsername}
            placeholder={t('auth:usernamePlaceholder')}
            autoCapitalize="none"
            error={errors.username}
          />
          <FormInput
            label={t('common:password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            title={t('auth:login')}
            onPress={handleLogin}
            loading={loading}
            style={styles.primaryButton}
          />

          <ThemedText
            type="defaultSemiBold"
            style={[styles.dividerTitle, { color: colors.text.inverse }]}
          >
            {t('auth:or')}
          </ThemedText>
          <View style={styles.socialRow}>
            <Button
              title={t('auth:continueGoogle')}
              onPress={() => handleSocialLogin('google')}
              variant="outlined"
              loading={socialLoading === 'google'}
              icon={<FontAwesome name="google" size={20} color={colors.primary.main} />}
              style={styles.socialButton}
            />
            <Button
              title={t('auth:continueFacebook')}
              onPress={() => handleSocialLogin('facebook')}
              variant="outlined"
              color="secondary"
              loading={socialLoading === 'facebook'}
              icon={<FontAwesome name="facebook" size={20} color={colors.info.main} />}
              style={styles.socialButton}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={[styles.linkText, { color: colors.text.inverse }]}>
              {t('auth:forgotPassword')}
            </ThemedText>
          </TouchableOpacity>
        </Card>

        <LegalLinks />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  welcomeImage: {
    width: 170,
    height: 170,
    marginBottom: 16,
    alignSelf: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeBody: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 4,
  },
  formSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  dividerTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  socialButton: {
    flex: 1,
  },
});
